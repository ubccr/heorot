import React, { useContext } from "react"
import { Row, Col, Button, Form, Container } from "react-bootstrap"
import PasswordReset from "./PasswordReset"

const Profile = () => {
  return (
    <>
      <Container className="bg-light rounded-3 mt-2 p-2 text-center">
        <Row className="mb-2 p-2">
          <Col>
            <legend>Profile</legend>
          </Col>
        </Row>
        <Row className="mb-2 p-2 border">
          <Col>/username/</Col>
          <Col>
            <PasswordReset />
          </Col>
        </Row>
        <Row className="mb-2 p-2 border">
          <Col>Themes:</Col>
          <Col>/cards/</Col>
        </Row>
      </Container>
    </>
  )
}

export default Profile
