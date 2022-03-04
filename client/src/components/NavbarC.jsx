import React, { useContext } from "react"
import { Navbar, Nav, Container } from "react-bootstrap"
import { Link } from "react-router-dom"
// import { ThemeContext } from "../contexts/ThemeContext"

const NavbarC = () => {
  //   const { theme, setTheme, changeTheme } = useContext(ThemeContext)
  //   FIXME: Implement Themes
  const theme = {
    navbar: "primary",
    navbarText: "dark",
  }
  return (
    <>
      <Navbar bg={theme.navbar} variant={theme.navbarText} expand="lg">
        <Container>
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
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default NavbarC
