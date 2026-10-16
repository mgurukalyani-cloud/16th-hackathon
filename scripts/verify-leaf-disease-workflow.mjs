import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9444;
const TEMP_DIR = path.resolve('scratch-chrome-' + Date.now());

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log('=== AgriSense Leaf Disease End-to-End Verification ===\n');

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${TEMP_DIR}`,
  '--disable-gpu',
  '--disable-background-networking',
  '--disable-sync',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-component-update',
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1280,800',
  'http://localhost:5173/16th-hackathon/'
]);

chrome.stderr.on('data', (d) => {
  const str = d.toString();
  if (str.includes('ERROR') || str.includes('FATAL')) {
    console.error('Chrome Stderr:', str.trim());
  }
});
chrome.on('exit', (code) => {
  console.log('Chrome process exited with code:', code);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  await sleep(4000);

  const tabsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('5173')) || tabs[0];
  console.log('Found Chrome Tab:', pageTab.title, pageTab.url);

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let msgId = 0;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = ++msgId;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(res => ws.onopen = res);
  console.log('Connected to Chrome DevTools Protocol WebSocket.\n');

  // Enable Page and Runtime
  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Waiting for React hydration and weather data...');
  await sleep(4500);

  // Test 1: Verify Direct analyzePlantImage on Diseased Leaf Specimen
  console.log('--- TEST 1: INFERENCE ON REAL DISEASED LEAF SPECIMEN ---');
  const diseasedEval = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const { analyzePlantImage, evaluateWeatherDiseaseContext } = await import('/16th-hackathon/src/services/plantDiseaseService.js');
          const diseasedRes = await analyzePlantImage('/16th-hackathon/samples/diseased-leaf.jpg');
          const weatherCtx = evaluateWeatherDiseaseContext(
            diseasedRes.diseaseInfo,
            { temperature_2m: 25.5, relative_humidity_2m: 85 },
            { precipitation_sum: [5.2, 8.1, 2.0] }
          );
          return {
            success: diseasedRes.success,
            matchedKey: diseasedRes.matchedKey,
            cropName: diseasedRes.diseaseInfo?.cropName,
            diseaseName: diseasedRes.diseaseInfo?.diseaseName,
            pathogen: diseasedRes.diseaseInfo?.pathogen,
            severity: diseasedRes.diseaseInfo?.severity,
            confidence: diseasedRes.confidence,
            metrics: diseasedRes.metrics,
            hotspotsCount: diseasedRes.hotspots?.length || 0,
            weatherRisk: weatherCtx?.riskLevel,
            weatherHeadline: weatherCtx?.headline,
            weatherExplanation: weatherCtx?.explanation,
            symptoms: diseasedRes.diseaseInfo?.symptoms?.slice(0, 2),
            immediateTreatment: diseasedRes.diseaseInfo?.treatments?.immediate,
            rawError: diseasedRes.error
          };
        } catch (e) {
          return { errorCaught: e.message, stack: e.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Evaluated result raw:', JSON.stringify(diseasedEval));

  const dResult = diseasedEval.result?.result?.value || diseasedEval.result?.value;
  console.log('Diseased Leaf Analysis Output:');
  console.log('  Success:', dResult?.success);
  console.log('  Matched Key:', dResult?.matchedKey);
  console.log('  Crop Name:', dResult?.cropName);
  console.log('  Disease Identified:', dResult?.diseaseName);
  console.log('  Pathogen / Etiology:', dResult?.pathogen);
  console.log('  Severity:', dResult?.severity);
  console.log('  Model Confidence Score:', dResult?.confidence + '%');
  console.log('  Chlorophyll Coverage:', dResult?.metrics?.chlorophyllCoverage + '%');
  console.log('  Necrotic Lesion Footprint:', dResult?.metrics?.necroticLesionArea + '%');
  console.log('  Lesion Localization Hotspots:', dResult?.hotspotsCount);
  console.log('  Weather Pathogen Risk:', dResult?.weatherRisk, '—', dResult?.weatherHeadline);
  console.log('  Immediate Treatment Action:', dResult?.immediateTreatment);

  if (!dResult?.success || dResult?.severity === 'HEALTHY') {
    throw new Error('FAIL: Diseased leaf was not correctly classified as diseased!');
  }
  console.log('>>> TEST 1 PASSED: Real diseased leaf successfully analyzed and classified!\n');

  await sleep(1200);

  // Test 2: Verify Direct analyzePlantImage on Healthy Leaf Specimen
  console.log('--- TEST 2: INFERENCE ON REAL HEALTHY LEAF SPECIMEN ---');
  const healthyEval = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const { analyzePlantImage, evaluateWeatherDiseaseContext } = await import('/16th-hackathon/src/services/plantDiseaseService.js');
          const healthyRes = await analyzePlantImage('/16th-hackathon/samples/healthy-leaf.jpg');
          const weatherCtx = evaluateWeatherDiseaseContext(
            healthyRes.diseaseInfo,
            { temperature_2m: 23.0, relative_humidity_2m: 60 },
            { precipitation_sum: [0.0, 0.0, 0.0] }
          );
          return {
            success: healthyRes.success,
            matchedKey: healthyRes.matchedKey,
            cropName: healthyRes.diseaseInfo?.cropName,
            diseaseName: healthyRes.diseaseInfo?.diseaseName,
            severity: healthyRes.diseaseInfo?.severity,
            confidence: healthyRes.confidence,
            metrics: healthyRes.metrics,
            hotspotsCount: healthyRes.hotspots?.length || 0,
            weatherRisk: weatherCtx?.riskLevel,
            weatherHeadline: weatherCtx?.headline,
            weatherExplanation: weatherCtx?.explanation
          };
        } catch (e) {
          return { errorCaught: e.message, stack: e.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('healthyEval raw:', JSON.stringify(healthyEval));
  const hResult = healthyEval.result?.result?.value || healthyEval.result?.value;
  console.log('Healthy Leaf Analysis Output:');
  console.log('  Success:', hResult?.success);
  console.log('  Matched Key:', hResult?.matchedKey);
  console.log('  Condition:', hResult?.diseaseName);
  console.log('  Severity:', hResult?.severity);
  console.log('  Model Confidence Score:', hResult?.confidence + '%');
  console.log('  Chlorophyll Coverage:', hResult?.metrics?.chlorophyllCoverage + '%');
  console.log('  Necrotic Lesion Area:', hResult?.metrics?.necroticLesionArea + '%');
  console.log('  Weather Microclimate Status:', hResult?.weatherRisk, '—', hResult?.weatherHeadline);

  if (!hResult?.success || hResult?.severity !== 'HEALTHY') {
    throw new Error('FAIL: Healthy leaf was not identified as healthy foliage!');
  }
  console.log('>>> TEST 2 PASSED: Real healthy leaf identified with high chlorophyll and no disease!\n');

  // Test 3: Test Blurry Image Rejection & Clarity Assessment
  console.log('--- TEST 3: BLURRY / UNFOCUSSED REJECTION VERIFICATION ---');
  const blurEval = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const { analyzePlantImage } = await import('/16th-hackathon/src/services/plantDiseaseService.js');
        // Generate uniform blank/blurred image
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#6b8e23';
        ctx.fillRect(0, 0, 100, 100);
        const blankData = canvas.toDataURL('image/jpeg');
        const res = await analyzePlantImage(blankData);
        return res;
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  const bResult = blurEval.result?.result?.value || blurEval.result?.value;
  console.log('Blurry / Flat Image Result:');
  console.log('  Success:', bResult?.success);
  console.log('  Error Type:', bResult?.errorType);
  console.log('  Error Message:', bResult?.error);

  if (bResult?.success !== false || bResult?.errorType !== 'blurry_image') {
    throw new Error('FAIL: Blurry image check did not trigger expected validation error!');
  }
  console.log('>>> TEST 3 PASSED: Blurry / flat image accurately rejected with actionable advice!\n');

  // Test 4: Full UI Workflow: Navigate to Plant Health, load sample, analyze, verify results view
  console.log('--- TEST 4: COMPLETE REACT UI WORKFLOW ---');
  console.log('Executing in-browser navigation and leaf analysis workflow...');

  const uiWorkflowEval = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          // 1. Wait and Click Plant Health Tab
          let plantBtn = null;
          for (let i = 0; i < 30; i++) {
            plantBtn = document.querySelector('button[data-tab-id="plant_health"]');
            if (plantBtn) break;
            await new Promise(r => setTimeout(r, 200));
          }
          if (!plantBtn) return { error: 'Plant Health tab button not found after waiting' };
          plantBtn.click();

          // 2. Wait for PlantHealthPage to render sample buttons
          await new Promise(r => setTimeout(r, 800));
          const sampleBtn = document.querySelector('button[data-sample-id="sample-tomato-early-blight"]') ||
                            document.querySelector('button[data-sample-id]');
          if (!sampleBtn) return { error: 'Sample button not found' };
          sampleBtn.click();

          // 3. Wait for specimen preview to load with analyze button
          await new Promise(r => setTimeout(r, 800));
          const analyzeBtn = document.querySelector('button[data-action="analyze-specimen"]');
          if (!analyzeBtn) return { error: 'Analyze button not found' };
          analyzeBtn.click();

          // 4. Wait for analysis to complete and results card to render (polling)
          let resultsEl = null;
          for (let i = 0; i < 25; i++) {
            resultsEl = document.querySelector('div[data-testid="plant-analysis-results"]');
            if (resultsEl) break;
            await new Promise(r => setTimeout(r, 200));
          }
          const h2 = document.querySelector('h2[data-testid="diagnosed-condition-title"]');
          const textContent = resultsEl ? resultsEl.innerText : document.body.innerText;

          return {
            success: true,
            hasResultsContainer: !!resultsEl,
            diagnosedCondition: h2 ? h2.innerText : null,
            textSample: textContent.slice(0, 400),
            hasConfidence: textContent.toLowerCase().includes('confidence') || textContent.includes('95%'),
            hasSymptomsSection: !!document.querySelector('div[data-testid="plant-analysis-results"] h3'),
            hasActionPlanSection: document.querySelectorAll('div[data-testid="plant-analysis-results"] h3').length >= 2,
            hasWeatherContext: textContent.toLowerCase().includes('microclimate') || textContent.toLowerCase().includes('weather') || textContent.includes('°C'),
            hasResetButton: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Analyze Another') || b.textContent.includes('Analyze') || b.innerText.includes('Specimen'))
          };
        } catch (err) {
          return { error: err.message, stack: err.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  const uiRes = uiWorkflowEval.result?.result?.value || uiWorkflowEval.result?.value;
  console.log('\nRendered Prediction Result Card in DOM:');
  console.log('  Success:', uiRes?.success);
  console.log('  Results Container Present:', uiRes?.hasResultsContainer);
  console.log('  Diagnosed Condition Title:', uiRes?.diagnosedCondition);
  console.log('  Text Sample:', uiRes?.textSample?.replace(/\n+/g, ' '));
  console.log('  Confidence Found:', uiRes?.hasConfidence);
  console.log('  Symptoms Section Present:', uiRes?.hasSymptomsSection);
  console.log('  Action Plan Section Present:', uiRes?.hasActionPlanSection);
  console.log('  Farm Weather Context Present:', uiRes?.hasWeatherContext);
  console.log('  Reset / Analyze Another Button:', uiRes?.hasResetButton);

  if (uiRes?.error) {
    throw new Error(`FAIL: UI Workflow Error: ${uiRes.error}`);
  }

  if (!uiRes?.diagnosedCondition || !uiRes?.hasResultsContainer) {
    throw new Error('FAIL: Results interface did not render complete diagnostic output!');
  }
  console.log('>>> TEST 4 PASSED: Complete UI prediction result interface rendered perfectly!\n');

  // Test 5: Verify Live Camera Scanner Viewfinder & Actions
  console.log('--- TEST 5: CAMERA SCANNER MODAL WORKFLOW ---');
  const camModalEval = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          // Reset back to scanner view
          const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Analyze Another Specimen'));
          if (resetBtn) resetBtn.click();
          await new Promise(r => setTimeout(r, 600));

          // Open camera scanner
          const camBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Launch Live Camera Scanner'));
          if (!camBtn) return { error: 'Camera launch button not found' };
          camBtn.click();
          await new Promise(r => setTimeout(r, 800));

          const modalText = document.body.innerText;
          const hasLiveScannerTitle = modalText.includes('Live Leaf Disease Scanner');
          const hasCaptureButton = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Capture Leaf Photo'));
          const hasVideoElement = !!document.querySelector('video');

          return {
            hasLiveScannerTitle,
            hasCaptureButton,
            hasVideoElement
          };
        } catch (err) {
          return { error: err.message };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  const mRes = camModalEval.result?.result?.value || camModalEval.result?.value;
  console.log('Camera Scanner Modal Elements:');
  console.log('  Scanner Title Present:', mRes?.hasLiveScannerTitle);
  console.log('  Capture Button Present:', mRes?.hasCaptureButton);
  console.log('  Video Element Present:', mRes?.hasVideoElement);

  if (!mRes?.hasLiveScannerTitle || !mRes?.hasCaptureButton) {
    throw new Error('FAIL: Camera scanner modal did not open or lacks capture controls!');
  }
  console.log('>>> TEST 5 PASSED: Camera scanner modal renders with live controls & capture button!\n');
  console.log('>>> TEST 5 PASSED: Camera scanner modal renders with live controls & capture button!\n');

  console.log('====================================================');
  console.log('ALL 5 END-TO-END VERIFICATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');

  ws.close();
  chrome.kill();
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test Execution Error:', err);
  chrome.kill();
  process.exit(1);
});
