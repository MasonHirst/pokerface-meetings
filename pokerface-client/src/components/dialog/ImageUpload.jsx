import React, { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import AvatarEditor from 'react-avatar-editor'
import muiStyles from '../../style/muiStyles'

const {
  Box,
  Typography,
  Button,
  Stack,
  Slider,
  ZoomInIcon,
  RotateLeftIcon,
  Switch,
  FormControlLabel,
} = muiStyles

const ImageUpload = ({ setPicture, picture, setShowUploader }) => {
  const [fileError, setFileError] = useState('')
  const editorRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const [unCroppedImage, setUnCroppedImage] = useState(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 })
  const [rotation, setRotation] = useState(0)
  const [customBgColor, setCustomBgColor] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const isImage = file.type.startsWith('image/')
      if (isImage) {
        setFileError('')
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result
          setUnCroppedImage(dataUrl)
        }
        reader.readAsDataURL(file)
      } else {
        setFileError('Please upload an image file')
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    multiple: false, // Allow only one file to be dropped
  })

  // image cropping
  const handlePositionChange = (newPosition) => {
    setPosition(newPosition)
  }

  const handleCrop = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas()
      const croppedImage = canvas.toDataURL()
      setPicture(croppedImage)
      setUnCroppedImage(null)
      setIsDragging(false)
      setShowUploader(false)
    } else {
      alert('No editor ref')
    }
  }

  return (
    <Box>
      {!unCroppedImage ? (
        <div
          {...getRootProps()}
          style={{
            height: isDragging && '100vh',
            position: isDragging && 'fixed',
            top: isDragging && '5px',
            left: isDragging && '5px',
            width: isDragging && '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDragging
              ? 'rgba(200, 160, 220, 0.5)'
              : 'transparent',
            transition: 'background-color 0.3s',
          }}
        >
          <input {...getInputProps()} />
          {fileError && (
            <Typography variant="h6" color="error">
              {fileError}
            </Typography>
          )}
          {isDragActive ? (
            <Typography>Drop the files here ...</Typography>
          ) : (
            !picture && (
              <Typography className="cursor-pointer">
                Drag your file here, or click to select files
              </Typography>
            )
          )}
        </div>
      ) : unCroppedImage ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <Typography variant="h5">
            Choose how your card will appear{' '}
          </Typography>
          <AvatarEditor
            ref={editorRef}
            image={unCroppedImage}
            width={120}
            height={196}
            border={50}
            rotate={rotation}
            borderRadius={10}
            color={[255, 255, 255, 0.6]}
            scale={scale}
            position={position}
            backgroundColor={customBgColor && '#ffffff'}
            style={{ backgroundColor: 'grey', borderRadius: '10px' }}
            disableBoundaryChecks
            onPositionChange={handlePositionChange}
          />
          <Button
            disabled={
              position.x === 0.5 &&
              position.y === 0.5 &&
              scale === 1 &&
              rotation === 0
            }
            onClick={() => {
              setRotation(0)
              setScale(1)
              setPosition({ x: 0.5, y: 0.5 })
            }}
            disableElevation
            variant="contained"
            sx={{
              textTransform: 'none',
              marginTop: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            Reset picture
          </Button>
          <FormControlLabel
            control={
              <Switch
                onChange={(e) => setCustomBgColor(e.target.checked)}
                color="primary"
              />
            }
            label="Add white background"
            sx={{ marginTop: '-10px' }}
          />
          <Stack
            spacing={2}
            direction={'row'}
            sx={{ marginTop: '10px' }}
            alignItems="center"
            // width={250}
          >
            <ZoomInIcon />
            <Slider
              sx={{ width: 200 }}
              aria-label="Volume"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              min={0.1}
              max={5}
              step={0.1}
            />
            <Typography sx={{ minWidth: '40px' }} variant="body1">
              {scale}
            </Typography>
          </Stack>
          <Stack
            spacing={2}
            direction={'row'}
            sx={{ marginTop: '10px' }}
            alignItems="center"
          >
            <RotateLeftIcon />
            <Slider
              sx={{ width: 200 }}
              aria-label="Volume"
              value={rotation}
              onChange={(e) => setRotation(e.target.value)}
              min={0}
              max={360}
            />
            <Typography sx={{ minWidth: '40px' }} variant="body1">
              {rotation}°
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'flex',
              gap: '10px',
              width: '100%',
            }}
          >
            <Button
              disableElevation
              fullWidth
              variant="contained"
              color="error"
              onClick={() => setShowUploader(false)}
              sx={{
                textTransform: 'none',
                marginTop: '10px',
                fontWeight: 'bold',
                fontSize: '17px',
              }}
            >
              Cancel
            </Button>
            <Button
              disableElevation
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleCrop}
              sx={{
                textTransform: 'none',
                marginTop: '10px',
                fontWeight: 'bold',
                fontSize: '17px',
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography>Something went wrong</Typography>
      )}
    </Box>
  )
}

export default ImageUpload
