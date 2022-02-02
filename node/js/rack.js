jQuery(function () {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const rack = urlParams.get("rack")

  if (rack == null) window.location = "test.html"

  $("#header").text(rack)

  rackX = ["", rack]
  rackY = [
    "42",
    "41",
    "40",
    "39",
    "38",
    "37",
    "36",
    "35",
    "34",
    "33",
    "32",
    "31",
    "30",
    "29",
    "28",
    "27",
    "26",
    "25",
    "24",
    "23",
    "22",
    "21",
    "20",
    "19",
    "18",
    "17",
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
    "04",
    "03",
    "02",
    "01",
  ]

  rackY.forEach((element) => {
    $("#rackTable tbody").append(
      "<tr><td>" + element + '</td><td id="u' + element + '"></td></tr>'
    )
  })

  // fake db for now
  fetch("http://localhost:3000/rack/" + rack)
    .then((res) => res.json())
    .then((data) => {
      data.nodes.forEach((element) => {
        let u = element.u
        // get previous td
        let u1 = (parseInt(u) + 1).toString()

        if (element.type == "R750") {
          //   append nodename to previous row for proper rowspan
          $("#u" + u1)
            .append(element.node)
            .attr("rowspan", 2)
          $("#u" + u).remove()
          //   everything else
        } else $("#u" + u).append(element.node)
      })
    })
})
