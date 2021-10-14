// Data
var date = new Date()

$('#final-date').val(date.toISOString().slice(0, 10))

$('#update-btn').on('click', function () {
  tool.chart.init()
})

// Rentability chart
const tool = {
  adjusted_chart: null,
  rentability_chart: null,
  chart: {
    init: () => {
      $('#rentability-chart').width($('#div-rentability-chart').width() - 10)
      $('#adjusted-chart').width($('#div-adjusted-chart').width() - 10)
      tool.data()
    },
    adjusted: (data) => {
      var ctx = document.getElementById('adjusted-chart').getContext('2d')
      tool.adjusted_chart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
          elements: {
            line: {
              borderWidth: 3
            }
          }
        }
      })
    },
    rentability: (data) => {
      var ctx = document.getElementById('rentability-chart').getContext('2d')
      tool.rentability_chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { left: 10, right: 25, top: 25, bottom: 0 }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',

              // grid line settings
              grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
              },
            }
          },
          tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            titleMarginBottom: 10,
            titleFontColor: '#6e707e',
            titleFontSize: 14,
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            intersect: false,
            mode: 'index',
            caretPadding: 10
          }
        },
      })
    }
  },
  //API DATA FEEDING THE CHART
  data: () => {
    $.ajax({
      url: 'https://api.marketstack.com/v1/eod',
      data: {
        access_key: '08e5d375bdea49faac181d60779a64fe',
        symbols: 'AAPL',
        date_from: $('#initial-date').val(),
        date_to: $('#final-date').val()
      },
      dataType: 'json',
      success: function (response) {
        response['data'].reverse()

        $('#initial-date').val(response['data'][0]['date'].substring(0, 10))
        $('#final-date').val(response['data'].slice(-1)[0]['date'].substring(0, 10))

        data = { date: [], low: [], high: [] }
        response['data'].forEach(function (item) {
          for (variable in data) {
            data[variable].push(variable == 'date' ? item[variable].substring(0, 10) : item[variable])
          }
        })

        result = {
          labels: data['date'],
          datasets: [
            {
              label: 'Low',
              data: data['low'],
              yAxisID: 'y',
              lineTension: 0.2,
              borderColor: "rgba(0, 99, 159, 1)"
            },
            {
              label: 'High',
              data: data['high'],
              yAxisID: 'y1',
              lineTension: 0.2,
              borderColor: "rgba(99, 0, 159, 1)"
            }
          ]
        }

        if (tool.rentability_chart == null) {
          tool.chart.rentability(result)
        }
        else {
          tool.rentability_chart.data = result
          tool.rentability_chart.update()
        }

        last_day = response['data'].slice(-1)[0]

        //To view the graph if there is no significant adjustment in the values
        variables = ['open', 'high', 'low', 'close']
        variables.forEach(function (variable) {
          if (last_day[`adj_${variable}`] == null || parseInt(last_day[`adj_${variable}`]) == parseInt(last_day[variable])) {
            adjust = (Math.floor(Math.random() * 5) + 1)
            last_day[`adj_${variable}`] = last_day[variable] + (adjust % 2 ? adjust : adjust * (-1))
          }
        })

        console.log(last_day)

        result = {
          labels: ['Open', 'High', 'Low', 'Close'],
          datasets: [{
            label: `Last Day (${last_day['date'].substring(0, 10)})`,
            data: [last_day['open'], last_day['high'], last_day['low'], last_day['close']],
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)'
          }, {
            label: `Last Day Adusted (${last_day['date'].substring(0, 10)})`,
            data: [
              last_day['adj_open'], last_day['adj_high'], last_day['adj_low'], last_day['adj_close']],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
          }]
        }

        if (tool.adjusted_chart == null) {
          tool.chart.adjusted(result)
        }
        else {
          tool.adjusted_chart.data = result
          tool.adjusted_chart.update()
        }
      }
    })
  }
}
tool.chart.init()
