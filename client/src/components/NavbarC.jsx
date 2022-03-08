import React, { useContext } from "react"
import { Navbar, Nav, Container, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"

const NavbarC = () => {
  const { theme } = useTheme()

  return (
    <>
      <Navbar bg={theme.navBg} variant={theme.navText} expand="lg">
        <Container fluid className="mx-2">
          <Navbar.Brand href="#home">
            <img
              src="favicon.ico"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt=""
              style={{
                backgroundColor: "white",
                padding: "4px",
                borderRadius: "5px",
              }}
            />{" "}
            CCR
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
            </Nav>
            <Button as={Link} to="/profile" variant={theme.navBtn}>
              Profile
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default NavbarC
