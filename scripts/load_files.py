#!/usr/bin/python
import sys
import clickhouse_connect
import time
import logging
import argparse

MIN_PYTHON = (3, 10)
if sys.version_info < MIN_PYTHON:
    sys.exit("Python %s.%s or later is required.\n" % MIN_PYTHON)

# -----------------------------------------------------------------------------------------------------------------------
# Logger Configuration
# -----------------------------------------------------------------------------------------------------------------------
LOGGER_FILENAME = "log.log"

logging.basicConfig(filename=LOGGER_FILENAME, format="%(asctime)s %(message)s", filemode='a')
logFormatter = logging.Formatter("%(asctime)s %(message)s")
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

consoleHandler = logging.StreamHandler()
consoleHandler.setFormatter(logFormatter)
logger.addHandler(consoleHandler)

# -----------------------------------------------------------------------------------------------------------------------
# Command line arguments parsing
# -----------------------------------------------------------------------------------------------------------------------
ap = argparse.ArgumentParser()

# ① ClickHouse connection settings ------------------------------------------------------------------------------------
ap.add_argument("--host", required=True)
ap.add_argument("--port", required=True)
ap.add_argument("--username", required=True)
ap.add_argument("--password", required=True)

source_parser = ap.add_mutually_exclusive_group(required=True)

# ② Data loading - main settings --------------------------------------------------------------------------------------
source_parser.add_argument("--url", required=False,
                           help='The url (which can contain glob patterns) specifying the set of files to be loaded.')
source_parser.add_argument("--file", required=False,
                           help='The CSV file specifying the set of files to be loaded.')
ap.add_argument("--rows_per_batch", required=True,
                help='How many rows should be loaded within a single batch transfer.')
ap.add_argument("--database", required=True,
                help='Name of the target ClickHouse database.')
ap.add_argument("--table", required=True,
                help='Name of the target ClickHouse table.')

# ③ Data loading - optional settings ----------------------------------------------------------------------------------
ap.add_argument("--cfg.function", required=False, default='s3',
                help='Name of the table function for accessing the to-be-loaded files.')

ap.add_argument("--cfg.use_cluster_function_for_file_list", required=False,
                help='Should the more efficient ...Cluster version of the table function be used for retrieving the file list?',
                action="store_true")

ap.add_argument("--cfg.cluster_name", required=False, default='default',
                help='Name of the cluster in case the ...Cluster table function version is used for retrieving the file list.')

ap.add_argument("--cfg.format", required=False,
                help='Name of the file format used.')

ap.add_argument("--cfg.structure", required=False,
                help='Structure of the file data.')

ap.add_argument("--cfg.select", required=False, default='SELECT *',
                help='Custom SELECT clause for retrieving the file data.')

ap.add_argument("--cfg.where", required=False,
                help='Custom WHERE clause for retrieving the file data.')

ap.add_argument("--cfg.staging_suffix", required=False, default='_staging',
                help='Suffix appended to the names of the staging tables and MVs.')

ap.add_argument('--cfg.query_settings', nargs='+', default=[], required=False,
                help='Custom query-level settings.')

args = vars(ap.parse_args())


# -----------------------------------------------------------------------------------------------------------------------
# Calling the main entry point
# -----------------------------------------------------------------------------------------------------------------------
def main():
    client = clickhouse_connect.get_client(
        host=args['host'],
        port=args['port'],
        username=args['username'],
        password=args['password'],
        secure=True)

    # Get full path urls and row counts for all to-be-loaded files
    logger.info(f"Fetching all files and row counts")
    configuration = to_configuration_dictionary(args)
    file_list = []
    if args['url']:
        file_list = get_file_urls_and_row_counts(args['url'], configuration, client)
    elif args['file']:
        file_list = get_file_urls_from_file(args['file'], int(args['rows_per_batch']))
    load_files(
        file_list=file_list,
        rows_per_batch=int(args['rows_per_batch']),
        db_dst=args['database'],
        tbl_dst=args['table'],
        client=client,
        configuration=configuration)


# -----------------------------------------------------------------------------------------------------------------------
# Main entry point to the code
# -----------------------------------------------------------------------------------------------------------------------
def load_files(file_list, rows_per_batch, db_dst, tbl_dst, client, configuration={}):
    # Step ①: Create all necessary staging tables (and MV clones)
    staging_tables = create_staging_tables(db_dst, tbl_dst, client, configuration)
    file_count = len(file_list)
    file_nr = 0
    logger.info(f"Done")
    logger.info(f"Processing {file_count} files")
    for [file_url, file_row_count] in file_list:
        file_nr = file_nr + 1
        logger.info(f"Processing file {file_nr} of {file_count}: {file_url}")
        logger.info(f"Row count: {file_row_count}")
        # Step ③: Load a single file (potentially in batches)
        if file_row_count > rows_per_batch:
            # ③.Ⓐ Load a single file in batches (because its file_row_count  > rows_per_batch)
            load_file_in_batches(file_url, file_row_count, rows_per_batch, staging_tables, configuration, client)
        else:
            # ③.Ⓑ Load a single file completely in one batch
            load_file_complete(file_url, staging_tables, configuration, client)
    # Cleanup: Drop all staging tables (and MV clones)
    drop_staging_tables(staging_tables, client)


def get_file_urls_from_file(file, rows_per_batch):
    file_list = []
    with open(file, 'r') as file_urls:
        for line in file_urls:
            file_list.append((line.strip(), rows_per_batch))
    return file_list


# -----------------------------------------------------------------------------------------------------------------------
# Load files - Step ②: Get full path urls and row counts for all to-be-loaded files
# -----------------------------------------------------------------------------------------------------------------------
def get_file_urls_and_row_counts(url, configuration, client):
    function_fragment = f"""{configuration['function']}("""
    if configuration['use_cluster_function_for_file_list'] == True:
        function_fragment = f"""{configuration['function']}Cluster({configuration['cluster_name']}, """

    format_fragment = f""", '{configuration['format']}'""" if 'format' in configuration else ''
    settings_fragment = f"""SETTINGS {to_string(configuration['settings'])}""" if 'settings' in configuration and len(
        configuration['settings']) > 0 else ''

    query = f"""
    WITH
        splitByString('://', '{url}')[1] AS _protocol,
        domain('{url}') AS _domain
    SELECT
        concat(_protocol, '://', _domain,  if(startsWith(_path, '/') , '', '/'), _path) as file,
        count() as count
    FROM {function_fragment}'{url}'{format_fragment}) {configuration['where']}
    GROUP BY 1
    ORDER BY 1
    {settings_fragment}"""

    logger.debug(f"Query for full path urls and row counts:{query}")

    result = client.query(query)
    return result.result_rows


# -----------------------------------------------------------------------------------------------------------------------
# Load files - Step ③.Ⓐ: Load a single file in batches (because its file_row_count  > rows_per_batch)
# -----------------------------------------------------------------------------------------------------------------------
def load_file_in_batches(file_url, file_row_count, rows_per_batch, staging_tables,
                         configuration, client):
    row_start = 0
    row_end = rows_per_batch
    while row_start < file_row_count:
        command = create_batch_load_command(file_url, staging_tables[0]['db_staging'], staging_tables[0]['tbl_staging'],
                                            configuration, row_start, row_end,
                                            extra_settings={'input_format_parquet_preserve_order': 1,
                                                            'parallelize_output_from_storages': 0})
        try:
            logger.debug(f"Batch loading file: {file_url}")
            logger.debug(f"Batch row block: {row_start} to {row_end}")
            logger.debug(f"Batch command: {command}")
            load_one_batch(command, staging_tables, client)
        except BatchFailedError as err:
            logger.error(f"{err=}")
            logger.error(f"Failed file: {file_url}")
            logger.error(f"Failed row block: {row_start} to {row_end}")
        row_start = row_end
        row_end = row_end + rows_per_batch


# -----------------------------------------------------------------------------------------------------------------------
# Load files - Step ③.Ⓑ: Load a single file completely in one batch (because its file_row_count  < rows_per_batch)
# -----------------------------------------------------------------------------------------------------------------------
def load_file_complete(file_url, staging_tables, configuration, client):
    command = create_batch_load_command(file_url, staging_tables[0]['db_staging'], staging_tables[0]['tbl_staging'],
                                        configuration)
    try:
        logger.debug(f"Batch loading file: {file_url}")
        logger.debug(f"Batch command: {command}")
        load_one_batch(command, staging_tables, client)
    except BatchFailedError as err:
        logger.error(f"{err=}")
        logger.error(f"Failed file: {file_url}")


# -----------------------------------------------------------------------------------------------------------------------
# Load one batch for a single file (Step ③.Ⓐ or Step ③.Ⓑ)
# -----------------------------------------------------------------------------------------------------------------------
def load_one_batch(batch_command, staging_tables, client):
    retries = 3
    attempt = 1
    while True:
        try:
            # Step ②: load one batch
            client.command(batch_command)
            # Step ③: move parts (of all partitions) from all staging tables to their corresponding destination tables
            break
        except Exception as err:
            logger.error(f"Unexpected {err=}, {type(err)=}")
            attempt = attempt + 1
            if attempt <= retries:
                # wait a bit for transient issues to resolve
                logger.info("Going to sleep for 60s")
                time.sleep(60)
                # Drop all parts from all staging tables
                logger.info(f"Starting attempt {attempt} of {retries}")
                logger.info(f"truncating tables before retry")
                for d in staging_tables:
                    client.command(f"TRUNCATE TABLE {d['db_staging']}.{d['tbl_staging']}")
                # retry the batch
                continue
            else:
                # we land here in case all retries are used unsuccessfully
                raise BatchFailedError(f"Batch still failed after {retries} attempts.")
    # we don't retry on move partitions only on data load
    for d in staging_tables:
        move_partitions(d['db_staging'], d['tbl_staging'], d['db_dst'], d['tbl_dst'], client)
    # Success or failure, nothing more to do here. Even in failure, we don't cause duplication
    return


# -----------------------------------------------------------------------------------------------------------------------
# Helper function for ③.Ⓐ and ③.Ⓑ: construct the batch load SQL command
# -----------------------------------------------------------------------------------------------------------------------
def create_batch_load_command(file_url, db_staging, tbl_staging, configuration, row_start=None, row_end=None,
                              extra_settings=None):
    # Handling of all optional configuration settings
    query_clause_fragments = to_query_clause_fragments(configuration, row_start, row_end, extra_settings)

    command = f"""
            INSERT INTO {db_staging}.{tbl_staging}
            {query_clause_fragments['select_fragment']} FROM {query_clause_fragments['function_fragment']}'{file_url}'{query_clause_fragments['format_fragment']}{query_clause_fragments['structure_fragment']})
            {query_clause_fragments['filter_fragment']}
            {query_clause_fragments['settings_fragment']}
        """

    return command


# -----------------------------------------------------------------------------------------------------------------------
# Helper function for ③.Ⓐ and ③.Ⓑ: Turn optional query configuration settings into fragments for the query clauses
# -----------------------------------------------------------------------------------------------------------------------
def to_query_clause_fragments(configuration, row_start=None, row_end=None, extra_settings=None):
    settings = {}
    if 'settings' in configuration:
        settings = {**settings, **configuration['settings']}
    if extra_settings:
        settings = {**settings, **extra_settings}

    filter_fragment = ''
    if 'where' in configuration:
        filter_fragment = configuration['where']
    if row_end:
        filter_fragment = filter_fragment + (' AND ' if len(filter_fragment) > 0 else ' WHERE ')
        filter_fragment = filter_fragment + f"""rowNumberInAllBlocks() >= {row_start} AND rowNumberInAllBlocks()  < {row_end}"""

    return {
        'function_fragment': f"""{configuration['function']}(""",
        'select_fragment': f"""{configuration['select']} """,
        'format_fragment': f""", '{configuration['format']}'""" if 'format' in configuration else '',
        'structure_fragment': f""", '{configuration['structure']}'""" if 'structure' in configuration else '',
        'filter_fragment': filter_fragment,
        'settings_fragment': f"""SETTINGS {to_string(settings)}""" if len(settings) > 0 else ''}


# -----------------------------------------------------------------------------------------------------------------------
# Transform dictionary items into comma-separated settings-fragment for SQL SETTINGS clause
# {'a' : 23, 'b' : 42} -> "'a' = 23, 'b' = 42"
# -----------------------------------------------------------------------------------------------------------------------
def to_string(settings):
    settings_string = ''
    for key in settings:
        settings_string += str(key) + ' = ' + str(settings[key]) + ', '
    return settings_string[:-2]


# -----------------------------------------------------------------------------------------------------------------------
# Our dedicated exception for indicating that a batch failed even after a few retries
# -----------------------------------------------------------------------------------------------------------------------
class BatchFailedError(Exception):
    pass


# -----------------------------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------------------------
# Staging tables
# -----------------------------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------------------------


# -----------------------------------------------------------------------------------------------------------------------
# Create all staging tables - one for the main target table, and one for each MV target table, we also clone all MVs
# -----------------------------------------------------------------------------------------------------------------------
def create_staging_tables(db_dst, tbl_dst, client, configuration):
    staging_tables = []
    db_staging = db_dst
    tbl_staging = tbl_dst + configuration['staging_suffix']
    # create staging table for main target table
    create_tbl_clone(db_dst, tbl_dst, db_staging, tbl_staging, client)
    staging_tables.append({
        'db_staging': db_staging, 'tbl_staging': tbl_staging,
        'db_dst': db_dst, 'tbl_dst': tbl_dst})
    # get infos about all MVs connected to the main target table
    mvs = get_mvs(db_dst, tbl_dst, client)
    for d in mvs:
        # MV infos
        db_mv = d['db_mv']
        mv = d['mv']
        db_mv_staging = db_mv
        mv_staging = mv + configuration['staging_suffix']

        # target table infos
        db_tgt = d['db_target']
        tbl_tgt = d['tbl_target']
        db_tgt_staging = db_tgt
        tbl_tgt_staging = tbl_tgt + configuration['staging_suffix']

        # create staging table for MV target table
        create_tbl_clone(db_tgt, tbl_tgt, db_tgt_staging, tbl_tgt_staging, client)
        # create MV clone - with staging table for main target table as source table
        #                   and staging table for original target table as target table
        create_mv_clone(
            mv_infos={'db_mv': db_mv, 'mv': mv,
                      'db_mv_clone': db_mv_staging, 'mv_clone': mv_staging},
            tbl_src_infos={'db_src': db_dst, 'tbl_src': tbl_dst,
                           'db_src_clone': db_staging, 'tbl_src_clone': tbl_staging},
            tbl_tgt_infos={'db_tgt': db_tgt, 'tbl_tgt': tbl_tgt,
                           'db_tgt_clone': db_tgt_staging, 'tbl_tgt_clone': tbl_tgt_staging},
            client=client)
        staging_tables.append({
            'db_mv': db_mv, 'mv': mv,
            'db_mv_staging': db_mv_staging, 'mv_staging': mv_staging,
            'db_staging': db_tgt_staging, 'tbl_staging': tbl_tgt_staging,
            'db_dst': db_tgt, 'tbl_dst': tbl_tgt})

    return staging_tables


# -----------------------------------------------------------------------------------------------------------------------
# Clone a table
# -----------------------------------------------------------------------------------------------------------------------
def create_tbl_clone(db_src, tbl_src, db_dst, tbl_dst, client):
    command = f"""
        CREATE OR REPLACE TABLE {db_dst}.{tbl_dst} AS {db_src}.{tbl_src}
        """
    logger.info(f"ddl_for_clone_table:")
    logger.info(f"{command}")
    client.command(command)


# -----------------------------------------------------------------------------------------------------------------------
# Drop all staging tables, including MV clones
# -----------------------------------------------------------------------------------------------------------------------
def drop_staging_tables(staging_tables, client):
    for d in staging_tables:
        if 'mv_staging' in d:
            # drop a mv clone
            client.command(f"""DROP VIEW IF EXISTS {d['db_mv_staging']}.{d['mv_staging']}""")
        # drop a staging table
        client.command(f"""DROP TABLE IF EXISTS {d['db_staging']}.{d['tbl_staging']}""")


# -----------------------------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------------------------
# Cloning MVs
# -----------------------------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------------------------


# -----------------------------------------------------------------------------------------------------------------------
# Fetch infos about all MVs connected to main target table
# -----------------------------------------------------------------------------------------------------------------------
def get_mvs(db_dst, tbl_dst, client):
    mvs = []
    result = client.query("""
        SELECT
               mvs.1 as db,
               mvs.2 as table
        FROM (
            SELECT arrayZip(dependencies_database, dependencies_table) as mvs
            FROM system.tables
            WHERE database = {db_dst:String} AND table = {tbl_dst:String}
             )
        ARRAY JOIN mvs as mvs""", parameters={'db_dst': db_dst, 'tbl_dst': tbl_dst})
    for row in result.result_rows:
        db_mv = row[0]
        mv = row[1]
        (db_target, tbl_target) = get_mv_target_table(db_mv, mv, client)
        mvs.append({'db_mv': db_mv, 'mv': mv, 'db_target': db_target, 'tbl_target': tbl_target})
    return mvs


# -----------------------------------------------------------------------------------------------------------------------
# Get db name and table name of a MV's target table
# -----------------------------------------------------------------------------------------------------------------------
def get_mv_target_table(db, mv, client):
    result = client.query("""
        SELECT target_db, target_table
        FROM (
            SELECT
                create_table_query,
                splitByString(' ', splitByString(' TO ', splitByString('CREATE MATERIALIZED VIEW ', create_table_query)[2])[2])[1] AS target_db_and_table,
                splitByChar('.', target_db_and_table)[1] AS target_db,
                replaceOne(target_db_and_table, target_db || '.', '') AS target_table
            FROM system.tables
            WHERE database = {db:String} AND table = {mv:String})""", parameters={'db': db, 'mv': mv})
    return (result.result_rows[0][0], result.result_rows[0][1])


# -----------------------------------------------------------------------------------------------------------------------
# Create MV clone - with new source table and new target table instead of original source table and target table
# -----------------------------------------------------------------------------------------------------------------------
def create_mv_clone(mv_infos, tbl_src_infos, tbl_tgt_infos, client):
    # drop staging mv in case a previous run got stopped before cleanup
    client.command(f"DROP VIEW IF EXISTS {mv_infos['db_mv_clone']}.{mv_infos['mv_clone']}")

    result = client.query("""
        SELECT
        replaceOne(
               replaceOne(
                   replaceOne(
                       create_table_query,
                       {db_mv:String} || '.' || {mv:String} || ' ',
                       {db_mv_clone:String} || '.' || {mv_clone:String} || ' '),
                    {db_tgt:String} || '.' || {tbl_tgt:String} || ' ',
                    {db_tgt_clone:String} || '.' || {tbl_tgt_clone:String} || ' '),
               ' FROM ' || {db_src:String} || '.' || {tbl_src:String} || ' ',
               ' FROM ' || {db_src_clone:String} || '.' || {tbl_src_clone:String} || ' ')  AS DDL
        FROM system.tables
        WHERE database = {db_mv:String} AND table = {mv:String}
    """, parameters={
        'db_mv': mv_infos['db_mv'], 'mv': mv_infos['mv'], 'db_mv_clone': mv_infos['db_mv_clone'],
        'mv_clone': mv_infos['mv_clone'],
        'db_src': tbl_src_infos['db_src'], 'tbl_src': tbl_src_infos['tbl_src'],
        'db_src_clone': tbl_src_infos['db_src_clone'], 'tbl_src_clone': tbl_src_infos['tbl_src_clone'],
        'db_tgt': tbl_tgt_infos['db_tgt'], 'tbl_tgt': tbl_tgt_infos['tbl_tgt'],
        'db_tgt_clone': tbl_tgt_infos['db_tgt_clone'], 'tbl_tgt_clone': tbl_tgt_infos['tbl_tgt_clone']})

    ddl_for_clone_mv = result.result_rows[0][0]
    logger.info(f"ddl_for_clone_mv:")
    logger.info(f"{ddl_for_clone_mv}")

    client.command(ddl_for_clone_mv)


# -----------------------------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------------------------
# Copying parts from one table to another
# -----------------------------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------------------------


# -----------------------------------------------------------------------------------------------------------------------
# Move all existing parts (for all partitions) from one table to another
# -----------------------------------------------------------------------------------------------------------------------
def move_partitions(db_src, tbl_src, db_dst, tbl_dst, client):
    partition_ids = get_partition_ids(db_src, tbl_src, client)
    for [partition_id] in partition_ids:
        logger.debug(f"Copy partition: {partition_id}")
        move_partition(partition_id, db_src, tbl_src, db_dst, tbl_dst, client)


# -----------------------------------------------------------------------------------------------------------------------
# Get names of all existing partitions for a table
# -----------------------------------------------------------------------------------------------------------------------
def get_partition_ids(db, table, client):
    result = client.query("""
        SELECT partition
        FROM system.parts
        WHERE database = {db:String}
          AND table = {table:String}
        GROUP BY partition
        ORDER BY partition
    """, parameters={'db': db, 'table': table})
    return result.result_rows


# -----------------------------------------------------------------------------------------------------------------------
# Move a single partition from one table to another
# -----------------------------------------------------------------------------------------------------------------------
def move_partition(partition_id, db_src, tbl_src, db_dst, tbl_dst, client):
    retries = 3
    attempt = 1
    while True:
        try:
            command = f"""
                ALTER TABLE {db_src}.{tbl_src}
                MOVE PARTITION {partition_id}
                TO TABLE {db_dst}.{tbl_dst}"""
            # logger.debug(f"{command}")
            client.command(command)
            return
        except Exception as err:
            logger.error(f"Unable to move partition {partition_id} for {db_src}.{tbl_src} to {db_dst}.{tbl_dst}")
            logger.error(f"Unexpected {err=}, {type(err)=}")
            attempt += 1
            if attempt <= retries:
                # wait a bit for transient issues to resolve
                logger.info("Going to sleep for 60s")
                time.sleep(60)
                # retry the batch
                logger.info(f"Starting attempt {attempt} of {retries} for move partition")
                continue
            else:
                # we land here in case all retries are used unsuccessfully
                raise BatchFailedError(f"Move partition still failed after {retries} attempts.")


# -----------------------------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------------------------
# Command line argument handling
# -----------------------------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------------------------


def to_configuration_dictionary(args):
    configuration = {}
    add_to_dictionary_if_present(configuration, args, 'cfg.function', 'function')
    add_to_dictionary_if_present(configuration, args, 'cfg.use_cluster_function_for_file_list',
                                 'use_cluster_function_for_file_list')
    add_to_dictionary_if_present(configuration, args, 'cfg.cluster_name', 'cluster_name')
    add_to_dictionary_if_present(configuration, args, 'cfg.format', 'format')
    add_to_dictionary_if_present(configuration, args, 'cfg.structure', 'structure')
    add_to_dictionary_if_present(configuration, args, 'cfg.select', 'select')
    add_to_dictionary_if_present(configuration, args, 'cfg.where', 'where')
    add_to_dictionary_if_present(configuration, args, 'cfg.staging_suffix', 'staging_suffix')
    configuration.update({'settings': to_query_settings_dictionary(args)})

    return configuration


def add_to_dictionary_if_present(dictionary, args, argument, key):
    if args[argument] != None:
        dictionary.update({key: args[argument]})


def to_query_settings_dictionary(args):
    query_settings = {}
    if len(args['cfg.query_settings']) > 0:
        for s in args['cfg.query_settings']:
            s_split = s.split('=')
            query_settings.update({s_split[0]: s_split[1]})
    return query_settings


main()