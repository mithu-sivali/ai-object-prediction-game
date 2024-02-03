import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ImageBackground } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocossd from '@tensorflow-models/coco-ssd'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as jpeg from 'jpeg-js'

const image = './assets/background.jpg'


const App = () => {
  const [isTfReady, setIsTfReady] = useState(false);
  const [result, setResult] = useState('');
  const [pickedImage, setPickedImage] = useState('');
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
   aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
    }
  };
  const classifyUsingMobilenet = async () => {
    try {
      // Load mobilenet.
      await tf.ready();
      const model = await mobilenet.load();
      setIsTfReady(true);
      console.log("starting inference with picked image: " + pickedImage)

      // Convert image to tensor
      const imgB64 = await FileSystem.readAsStringAsync(pickedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer)
      const imageTensor = decodeJpeg(raw);
      // Classify the tensor and show the result
      const prediction = await model.classify(imageTensor);
      if (prediction && prediction.length > 0) {
        setResult(
          (prediction[0].className + ' ' +prediction[0].probability.toFixed(3))
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    classifyUsingMobilenet()
  }, [pickedImage]);
  return (
    <View
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:  'blue',
      }}
    >
      <ImageBackground style={ styles.imgBackground } 
                  resizeMode='cover' 
                  source={require('./assets/background.jpg')}>
          <Text style={styles.resultText}>Let's play</Text>
          <View style={{ width: '100%', height: 20 }} />
      <Image
        source={{ uri: pickedImage }}
        style={{ width: 200, height: 200, margin: 40 }}
      />
      {isTfReady && <Button
        title="Pick an image"
        onPress={pickImage}
        color={'white'}
      /> }
      <View style={{ width: '100%', height: 20 }} />
      {!isTfReady && <Text>Loading TFJS model...</Text>}
      {isTfReady && result === '' && <Text>Result...</Text>}
      {result !== '' && <Text style={styles.resultText}>{result}</Text>}
    </ImageBackground>  
    </View>
  );
};
const styles = StyleSheet.create({
  titleText: {
    color: '#271502',
  },
  loadingText: {
    color: '#fff',
  },
  resultText: {
    color: 'white',
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1 
  },
});
export default App;