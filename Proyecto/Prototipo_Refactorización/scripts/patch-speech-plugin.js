// Script automático de parche para @capacitor-community/speech-recognition
// Corrige el bug crítico donde stop() no llamaba a call.resolve(), provocando cuelgues indefinidos en Android.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFile = path.resolve(
  __dirname,
  '../node_modules/@capacitor-community/speech-recognition/android/src/main/java/com/getcapacitor/community/speechrecognition/SpeechRecognition.java'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('stopListening();') && !content.includes('stopListening();\n            call.resolve();')) {
    content = content.replace(
      'stopListening();',
      'stopListening();\n            call.resolve();'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[Patch] @capacitor-community/speech-recognition SpeechRecognition.java parcheado con call.resolve().');
  } else {
    console.log('[Patch] SpeechRecognition.java ya contiene call.resolve() o no requiere parche.');
  }
} else {
  console.log('[Patch] Archivo SpeechRecognition.java no encontrado (aún no se ejecuta npm install).');
}

