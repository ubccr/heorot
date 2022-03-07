import { useState } from "react"
import { Modal, Button, Form, Row, Col } from "react-bootstrap"

const PasswordReset = () => {
  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const updatePassword = () => {
    alert("password updated")
    // TODO: Password validation & db update
  }

  return (
    <>
      <Button variant="outline-primary" onClick={handleShow}>
        Change Password
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Password Reset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Control placeHolder="Enter new password" />
              </Col>
              <Col>
                <Form.Control placeHolder="Re-enter new password" />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="outline-primary" onClick={updatePassword}>
            Update Password
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default PasswordReset
