jQuery(function () {
  $("#floorPlanTable").append("<thead></thead><tbody></tbody>")
  floorPlan = new Array()
  floorX = [..."defghijklmnopqrstuvwxyz"]
  floorY = [
    "28",
    "27",
    "26",
    "25",
    "24",
    "23",
    "22",
    "16",
    "15",
    "14",
    "13",
    "12",
    "11",
    "10",
    "09",
    "08",
    "07",
    "06",
    "05",
  ]

  floorX.forEach((X) => {
    $("#floorPlanTable tbody").append('<tr id="' + X + '"></tr>')
    // floorPlan[X] = []
    floorY.forEach((Y) => {
      $("#" + X).append('<td id="' + (X + Y) + '"></td>')
      //   floorPlan[X][Y] = X + Y
    })
  })

  fetch("http://localhost:3000/data")
    .then((res) => res.json())
    .then((data) => {
      data.table.forEach((element) => {
        $("#" + element).append(
          '<button onclick="rackOpen(this)" class="tableBtn btn btn-outline-primary btn-sm">' +
            element +
            "</button>"
        )
      })
    })

  // Popover init
  var popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
  )
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  })
})
