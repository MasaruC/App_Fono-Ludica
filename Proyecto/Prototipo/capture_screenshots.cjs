const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CAPTURAS_DIR = path.resolve('D:\\.Antigravity\\IHC\\Proyecto\\Documentación\\capturas');

if (!fs.existsSync(CAPTURAS_DIR)) {
  fs.mkdirSync(CAPTURAS_DIR, { recursive: true });
}

async function capture() {
  console.log('Iniciando captura de pantallas...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // 1. Menú Principal
  console.log('Capturando 01_menu_principal.png...');
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '01_menu_principal.png') });

  // 2. Modo CVI
  console.log('Capturando 12_modo_alto_contraste_cvi.png...');
  await page.evaluate(() => document.getElementById('btnCviToggle').click());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '12_modo_alto_contraste_cvi.png') });
  await page.evaluate(() => document.getElementById('btnCviToggle').click()); // desactivar CVI
  await new Promise(r => setTimeout(r, 400));

  // 3. Ejercicio Fono-Lúdico (Trabalenguas)
  console.log('Capturando 02_ejercicio_landscape.png...');
  await page.evaluate(() => document.getElementById('wagon-trabalenguas').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '02_ejercicio_landscape.png') });

  // 4. Modal Praxia 2D desde Ejercicio
  console.log('Capturando 06_praxia_bucofacial_2d.png...');
  await page.evaluate(() => document.getElementById('btnOpenMiniPraxia').click());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '06_praxia_bucofacial_2d.png') });
  await page.evaluate(() => document.getElementById('btnClosePraxia').click());
  await new Promise(r => setTimeout(r, 400));

  // Volver al Menú
  await page.evaluate(() => document.getElementById('btnBackMenu').click());
  await new Promise(r => setTimeout(r, 400));

  // 5. Carrera Fónica
  console.log('Capturando 03_carrera_fonica.png...');
  await page.evaluate(() => document.getElementById('wagon-carrera').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '03_carrera_fonica.png') });

  // Volver al Menú
  await page.evaluate(() => document.getElementById('btnBackMenu').click());
  await new Promise(r => setTimeout(r, 400));

  // 6. Bingo Sonoro
  console.log('Capturando 04_bingo_sonoro.png...');
  await page.evaluate(() => document.getElementById('wagon-bingo').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '04_bingo_sonoro.png') });

  // Volver al Menú
  await page.evaluate(() => document.getElementById('btnBackMenu').click());
  await new Promise(r => setTimeout(r, 400));

  // 7. Pares Mínimos
  console.log('Capturando 05_pares_minimos.png...');
  await page.evaluate(() => (document.getElementById('wagon-pares') || document.getElementById('btnOpenPairs')).click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '05_pares_minimos.png') });

  // Volver al Menú
  await page.evaluate(() => document.getElementById('btnBackMenu').click());
  await new Promise(r => setTimeout(r, 400));

  // 8. Cueva del Avatar
  console.log('Capturando 07_cueva_avatar_premios.png...');
  await page.evaluate(() => document.getElementById('btnOpenAvatar').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '07_cueva_avatar_premios.png') });

  // Volver al Menú
  await page.evaluate(() => document.getElementById('btnBackMenu').click());
  await new Promise(r => setTimeout(r, 400));

  // 9. Modal MathGate
  console.log('Capturando 08_control_parental_mathgate.png...');
  await page.evaluate(() => document.getElementById('btnParentalGate').click());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '08_control_parental_mathgate.png') });

  // Entrar al Portal Adulto resolviendo o navegando
  await page.evaluate(() => {
    document.getElementById('mathgateModal').classList.remove('active');
    document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-adult').classList.add('active');
    document.getElementById('btnBackMenu').style.visibility = 'visible';
    document.getElementById('headerScreenTag').textContent = 'Portal Clínico Docente';
  });
  await new Promise(r => setTimeout(r, 600));

  // 10. Dashboard Clínico: Tab Calibración
  console.log('Capturando 09_dashboard_clinico_calibracion.png...');
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '09_dashboard_clinico_calibracion.png') });

  // 11. Dashboard Clínico: Tab Curva PSF (TEPROSIF)
  console.log('Capturando 10_dashboard_clinico_psf_teprosif.png...');
  await page.evaluate(() => {
    document.querySelector('button[data-target="tab-psf-charts"]').click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '10_dashboard_clinico_psf_teprosif.png') });

  // 12. Dashboard Clínico: Tab Bóveda de Muestras de Audio
  console.log('Capturando 11_dashboard_clinico_boveda_audio.png...');
  await page.evaluate(() => {
    document.querySelector('button[data-target="tab-audio-vault"]').click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '11_dashboard_clinico_boveda_audio.png') });

  // 13. Dashboard Clínico: Tab Trazabilidad RTM de Literatura
  console.log('Capturando 13_dashboard_clinico_trazabilidad.png...');
  await page.evaluate(() => {
    document.querySelector('button[data-target="tab-literature"]').click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(CAPTURAS_DIR, '13_dashboard_clinico_trazabilidad.png') });

  await browser.close();
  console.log('¡Todas las 13 capturas se han generado exitosamente!');
}

capture().catch(err => {
  console.error('Error al capturar pantallas:', err);
  process.exit(1);
});
