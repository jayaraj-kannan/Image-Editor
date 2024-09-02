import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Container, Card, Button, Form, Row, Col, Image, InputGroup } from 'react-bootstrap';

const ImageResizer = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [desiredSize, setDesiredSize] = useState(20); // Default to 20 KB

  const handleImageUpload = (event) => {
    const imageFile = event.target.files[0];
    if (imageFile) {
      setOriginalImage(imageFile);
      setOriginalSize((imageFile.size)); // Convert bytes to KB
      setCompressedImage(null); // Reset compressed image on new upload
    }
  };

  const handleSizeChange = (event) => {
    const size = parseFloat(event.target.value);
    if (size > 0 && size <= originalSize) {
      setDesiredSize(size);
    }
  };

  const handleImageCompression = async () => {
    if (!originalImage) return;

    const options = {
      maxSizeMB: desiredSize / 1024, // Convert KB to MB
      useWebWorker: true,
      maxIteration: 20, // Maximum iterations to achieve desired file size
    };

    try {
      const compressedFile = await imageCompression(originalImage, options);

      // Check if the compressed file size is less than or close to the desired size
      const finalCompressedSize = compressedFile.size / 1024; // Convert to KB
      if (finalCompressedSize <= desiredSize) {
        setCompressedImage(compressedFile);
        setCompressedSize(finalCompressedSize.toFixed(2)); // Convert bytes to KB
      } else {
        alert('Unable to compress to the exact desired size. Try a higher value.');
      }
    } catch (error) {
      console.error('Error during image compression:', error);
    }
  };

  const handleDownload = () => {
    if (!compressedImage) return;

    const url = URL.createObjectURL(compressedImage);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_${originalImage.name}`;
    link.click();
  };

  return (
    <Container fluid className="my-4">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Upload and Compress Image</Card.Title>
              <Form>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Upload your image</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                </Form.Group>
                {originalImage && (
                  <div>
                    <Image
                      src={URL.createObjectURL(originalImage)}
                      thumbnail
                      className="mb-3"
                    />
                    <p>Original Size: {originalSize} KB</p>
                    <Form.Group controlId="formDesiredSize" className="mb-3">
                      <Form.Label>Desired Size (in KB)</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          value={desiredSize}
                          min="1"
                          max={originalSize}
                          onChange={handleSizeChange}
                        />
                        <InputGroup.Text>KB</InputGroup.Text>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Please enter a size between 1 KB and {originalSize} KB.
                      </Form.Text>
                    </Form.Group>
                    <Button
                      variant="primary"
                      onClick={handleImageCompression}
                      className="me-2"
                      disabled={desiredSize > originalSize || desiredSize <= 0}
                    >
                      Compress Image
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {compressedImage && (
          <Col md={6} lg={5}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Compressed Image</Card.Title>
                <Image
                  src={URL.createObjectURL(compressedImage)}
                  thumbnail
                  className="mb-3"
                  style={{ maxWidth: '100%', height: 'auto' }} // Ensure image fits within the card
                />
                <p>Compressed Size: {compressedSize} KB</p>
                <Button variant="success" onClick={handleDownload}>
                  Download Compressed Image
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ImageResizer;
