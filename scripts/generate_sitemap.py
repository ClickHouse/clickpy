# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "pandas", "clickhouse-connect"
# ]
# ///


import datetime
import clickhouse_connect
import xml.etree.ElementTree as ET
from xml.dom import minidom
import os

def generate_sitemap(urls, file):
    # Create the root element for the XML tree
    root = ET.Element("urlset")
    root.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

    current_time = datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"    
    
    # Iterate over each URL and create XML elements
    for url in urls:
        # Create <url> element
        url_elem = ET.SubElement(root, "url")
        
        # Create <loc> element and set URL
        loc_elem = ET.SubElement(url_elem, "loc")
        loc_elem.text = url
        
        # Create <lastmod> element and set current date
        lastmod_elem = ET.SubElement(url_elem, "lastmod")
        lastmod_elem.text = current_time
        
        # # Create <changefreq> element and set frequency of change
        # changefreq_elem = ET.SubElement(url_elem, "changefreq")
        # changefreq_elem.text = "daily"
        
        # # Create <priority> element and set priority
        # priority_elem = ET.SubElement(url_elem, "priority")
        # priority_elem.text = "0.8"

    # Convert the ElementTree to a string with proper formatting
    xmlstr = minidom.parseString(ET.tostring(root)).toprettyxml(indent="  ")
    
    # Write the formatted XML string to a file
    with open(file, "w", encoding="utf-8") as f:
        f.write(xmlstr)

client = clickhouse_connect.get_client(
    host='sql-clickhouse.clickhouse.com', 
    port=8443, 
    username=os.getenv("CLICKHOUSE_USER"), 
    password=os.getenv("CLICKHOUSE_PASSWORD")
)

query = """
SELECT
    name,
    sum(count) AS c
FROM rubygems.gem_downloads_total
GROUP BY name
ORDER BY c DESC
LIMIT 50000
"""

result = client.query(query)

urls = [
    f"https://clickgems.clickhouse.com/dashboard/{row[0]}"
    for row in result.result_rows
] 

generate_sitemap(urls, f"src/app/sitemap.xml")
