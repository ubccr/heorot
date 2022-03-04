// import { useContext } from "react"
import { Col, Container, Row } from "react-bootstrap"
// import { ThemeContext } from "../contexts/ThemeContext"

function Home() {
  //   const { theme, changeTheme } = useContext(ThemeContext)

  return (
    <Container className={`bg-light rounded-3 mt-2 p-2 text-center`}>
      <Row>
        <Col>
          <h1 className="fs-1">Dev React webpage designed by: Josh Furlani</h1>
        </Col>
      </Row>
      <hr></hr>
      <Row>
        <Col>
          <h2 className="fs-5">
            Report any feature feature requests and / or bugs to
            jafurlan@buffalo.edu
          </h2>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
