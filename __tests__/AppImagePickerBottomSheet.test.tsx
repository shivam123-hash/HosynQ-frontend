import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AppImagePickerBottomSheet from '../src/components/AppImagePickerBottomSheet';
import ImagePicker from 'react-native-image-crop-picker';

describe('AppImagePickerBottomSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal options correctly', () => {
    const handleClose = jest.fn();
    const handleSelect = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppImagePickerBottomSheet
          visible={true}
          title="Upload Certificate"
          subtitle="Take a photo or choose an image from your gallery"
          onSelectImage={handleSelect}
          onClose={handleClose}
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Upload Certificate' })).toBeTruthy();
    expect(root.findByProps({ children: 'Take photo' })).toBeTruthy();
    expect(root.findByProps({ children: 'Choose from gallery' })).toBeTruthy();
    expect(root.findByProps({ children: 'Cancel' })).toBeTruthy();
  });

  it('handles taking photo from camera', async () => {
    const handleClose = jest.fn();
    const handleSelect = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppImagePickerBottomSheet
          visible={true}
          onSelectImage={handleSelect}
          onClose={handleClose}
        />,
      );
    });

    const cameraButton = renderer!.root.findByProps({
      accessibilityLabel: 'Take photo',
    });

    await ReactTestRenderer.act(async () => {
      cameraButton.props.onPress();
    });

    expect(ImagePicker.openCamera).toHaveBeenCalled();
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'mocked-camera-path.jpg',
      }),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('handles choosing image from gallery', async () => {
    const handleClose = jest.fn();
    const handleSelect = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppImagePickerBottomSheet
          visible={true}
          onSelectImage={handleSelect}
          onClose={handleClose}
        />,
      );
    });

    const galleryButton = renderer!.root.findByProps({
      accessibilityLabel: 'Choose from gallery',
    });

    await ReactTestRenderer.act(async () => {
      galleryButton.props.onPress();
    });

    expect(ImagePicker.openPicker).toHaveBeenCalled();
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'mocked-picker-path.jpg',
      }),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('handles cancel press', () => {
    const handleClose = jest.fn();
    const handleSelect = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppImagePickerBottomSheet
          visible={true}
          onSelectImage={handleSelect}
          onClose={handleClose}
        />,
      );
    });

    const cancelBtn = renderer!.root.findByProps({
      accessibilityLabel: 'Cancel picker',
    });

    ReactTestRenderer.act(() => {
      cancelBtn.props.onPress();
    });

    expect(handleClose).toHaveBeenCalled();
  });
});

