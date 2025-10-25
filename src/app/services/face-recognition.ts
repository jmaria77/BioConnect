import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root'
})
export class FaceRecognitionService {
  private isModelLoaded = false;

  constructor() {
    this.loadModels();
  }

  async loadModels() {
    try {
      // Cargar modelos de face-api.js desde assets locales
      const modelPath = '/assets/models';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
      ]);
      
      this.isModelLoaded = true;
      console.log('Modelos de reconocimiento facial cargados');
    } catch (error) {
      console.error('Error cargando modelos:', error);
      // Intentar cargar modelos desde CDN como fallback
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
          faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
          faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
          faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
        ]);
        this.isModelLoaded = true;
        console.log('Modelos cargados desde CDN');
      } catch (cdnError) {
        console.error('Error cargando modelos desde CDN:', cdnError);
      }
    }
  }

  async capturePhoto(): Promise<string> {
    try {
      console.log('Iniciando captura de foto...');
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false
      });

      console.log('Foto capturada exitosamente:', image.webPath);
      return image.webPath || '';
    } catch (error) {
      console.error('Error capturando foto:', error);
      
      // Manejar errores específicos
      if (error.message && error.message.includes('permission')) {
        throw new Error('Permisos de cámara no concedidos. Por favor, habilita el acceso a la cámara en la configuración de la aplicación.');
      } else if (error.message && error.message.includes('camera')) {
        throw new Error('No se pudo acceder a la cámara. Verifica que la cámara esté disponible.');
      } else {
        throw new Error('Error inesperado al capturar la foto. Intenta nuevamente.');
      }
    }
  }

  async processFace(imageUri: string): Promise<Float32Array | null> {
    if (!this.isModelLoaded) {
      await this.loadModels();
    }

    try {
      // Crear elemento de imagen
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            // Detectar cara y extraer descriptor
            const detection = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detection) {
              resolve(detection.descriptor);
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => reject(new Error('Error cargando imagen'));
        img.src = imageUri;
      });
    } catch (error) {
      console.error('Error procesando cara:', error);
      throw error;
    }
  }

  async compareFaces(descriptor1: Float32Array, descriptor2: Float32Array): Promise<number> {
    try {
      const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
      // Distancia menor a 0.6 generalmente indica la misma persona
      return distance;
    } catch (error) {
      console.error('Error comparando caras:', error);
      throw error;
    }
  }

  async saveFaceDescriptor(userId: string, descriptor: Float32Array): Promise<void> {
    try {
      const descriptorArray = Array.from(descriptor);
      const data = JSON.stringify(descriptorArray);
      
      await Filesystem.writeFile({
        path: `face_${userId}.json`,
        data: data,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
    } catch (error) {
      console.error('Error guardando descriptor:', error);
      throw error;
    }
  }

  async loadFaceDescriptor(userId: string): Promise<Float32Array | null> {
    try {
      const file = await Filesystem.readFile({
        path: `face_${userId}.json`,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });

      const descriptorArray = JSON.parse(file.data as string);
      return new Float32Array(descriptorArray);
    } catch (error) {
      console.error('Error cargando descriptor:', error);
      return null;
    }
  }

  async authenticateUser(userId: string): Promise<boolean> {
    try {
      // Capturar nueva foto
      const imageUri = await this.capturePhoto();
      
      // Procesar cara de la nueva foto
      const newDescriptor = await this.processFace(imageUri);
      if (!newDescriptor) {
        return false;
      }

      // Cargar descriptor guardado
      const savedDescriptor = await this.loadFaceDescriptor(userId);
      if (!savedDescriptor) {
        return false;
      }

      // Comparar descriptores
      const distance = await this.compareFaces(newDescriptor, savedDescriptor);
      
      // Si la distancia es menor a 0.6, es la misma persona
      return distance < 0.6;
    } catch (error) {
      console.error('Error en autenticación:', error);
      return false;
    }
  }
}