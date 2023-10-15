
export const onChartReady = (echarts) => {
  setTimeout(function () {
    echarts.hideLoading();
  }, 3000);
}

export const chartLoadingOption = {
  text: 'Loading',
  color: '#FCFF74',
  textColor: '#FFFFFF',
  maskColor: 'rgba(0, 0, 0, 0.5)',
  zlevel: 1
};
