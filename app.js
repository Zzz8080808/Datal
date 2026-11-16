'use strict';
/** Local educational interactions. Data are fictitious; no information is sent to a server. */
const $ = (id) => document.getElementById(id);
const menu = $('menu');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); $('navigation').classList.toggle('open', open); });
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); $('navigation').classList.remove('open'); }));
const stories = [
 ['Definir la pregunta','¿Cómo cambió la proporción de piezas defectuosas entre enero y junio? La audiencia es el equipo de calidad y la meta es decidir qué investigar.'],
 ['Preparar la evidencia','Registramos defectos por cada 100 piezas: 12, 10, 9, 7, 5 y 3. Antes de comparar, verificamos períodos, criterios de inspección, registros faltantes y tamaño de los lotes. Estos datos son ficticios.'],
 ['Encontrar el patrón','La tasa baja del 12 % al 3 %. Son 9 puntos porcentuales menos, una reducción relativa del 75 %. Revisar turnos, productos y muestras ayuda a interpretar el resultado.'],
 ['Comunicar con contexto','Título: «La tasa de defectos se redujo del 12 % al 3 % en seis meses». Usamos un gráfico temporal y aclaramos que no tenemos evidencia para atribuir la mejora a una única causa.'],
 ['Proponer y comprobar','Investigar cambios en mantenimiento, capacitación y materiales. Comparar condiciones equivalentes y monitorear nuevos lotes antes de concluir qué intervención funcionó.']
];
/** Show a single narrative stage and synchronize accessible button state. */
function showStory(index) { document.querySelectorAll('[data-step]').forEach(b => b.setAttribute('aria-pressed',String(Number(b.dataset.step) === index))); $('story-detail').innerHTML = `<span>0${index+1}</span><h3>${stories[index][0]}</h3><p>${stories[index][1]}</p>`; }
document.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => showStory(Number(b.dataset.step)))); showStory(0);
const defects = [12,10,9,7,5,3], months = ['Ene','Feb','Mar','Abr','May','Jun'];
/** Draw an accessible, zero-based chart from the same six observations in both modes. */
function drawChart() {
 const highlight=$('highlight').checked, line=$('chart-type').value === 'line';
 let svg='<svg viewBox="0 0 600 300" role="img" aria-labelledby="plot-title"><title id="plot-title">Defectos por cada 100 piezas: enero 12, febrero 10, marzo 9, abril 7, mayo 5, junio 3.</title>';
 [0,3,6,9,12].forEach(v => { const y=245-v*16; svg+=`<path d="M45 ${y}H580" stroke="#ffffff20"/><text x="30" y="${y+4}" text-anchor="end">${v}</text>`; });
 const points=defects.map((v,i)=>[85+i*90,245-v*16]);
 if(line) svg+=`<polyline points="${points.map(p=>p.join(',')).join(' ')}" stroke="#b9f772" stroke-width="3" fill="none"/>`;
 points.forEach(([x,y],i)=>{const color=highlight && i===5?'#b9f772':'#69a9a4';svg+=line?`<circle cx="${x}" cy="${y}" r="6" fill="${color}"/>`:`<rect x="${x-23}" y="${y}" width="46" height="${245-y}" rx="4" fill="${color}"/>`; svg+=`<text x="${x}" y="${y-13}" text-anchor="middle">${defects[i]}</text><text x="${x}" y="272" text-anchor="middle">${months[i]}</text>`;});
 $('chart').innerHTML=svg+'</svg>';
 $('chart-insight').textContent=highlight?'Hallazgo: en junio hay 3 defectos por cada 100 piezas frente a 12 en enero. La reducción relativa es del 75 %.':'Observá los seis meses: ¿qué cambió entre el inicio y el final? Activá el hallazgo para comparar tu interpretación.';
}
$('chart-type').addEventListener('change',drawChart);$('highlight').addEventListener('change',drawChart);drawChart();
const modes={batch:'Por lotes: procesa conjuntos acumulados en momentos definidos. Ejemplo: calcular cada noche los defectos del día. Suele ser apropiado cuando la respuesta inmediata no es necesaria.',stream:'En flujo: procesa eventos conforme llegan, con una latencia que depende del sistema. Ejemplo: detectar una temperatura fuera de rango. Hay que gestionar eventos tardíos, orden y duplicados; no equivale a latencia cero.'};
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('mode-detail').textContent=modes[b.dataset.mode];}));
let selected=0,pixels=[];
/** Build an editable 8x8 raster; labels expose coordinates and channel values without relying on color. */
function resetPixels(){pixels=Array.from({length:64},(_,i)=>{const x=i%8,y=Math.floor(i/8);return (x===y||x===7-y)?[6,117,110]:[224,232,216];});selected=0;renderPixels();selectPixel(0);}
function renderPixels(){const grid=$('pixel-grid');grid.replaceChildren();pixels.forEach((rgb,i)=>{const b=document.createElement('button');b.type='button';b.style.backgroundColor=`rgb(${rgb.join(',')})`;b.setAttribute('aria-label',`Fila ${Math.floor(i/8)+1}, columna ${i%8+1}: RGB ${rgb.join(', ')}`);b.setAttribute('aria-pressed',String(i===selected));b.addEventListener('click',()=>selectPixel(i));grid.append(b);});}
function selectPixel(i){selected=i;['red','green','blue'].forEach((c,j)=>{$(c).value=pixels[i][j];});$('pixel-title').textContent=`Píxel: fila ${Math.floor(i/8)+1}, columna ${i%8+1}`;updatePixel();}
function updatePixel(){const rgb=['red','green','blue'].map(c=>{const value=Number($(c).value);$(c+'-value').value=value;return value;});pixels[selected]=rgb;$('swatch').style.backgroundColor=`rgb(${rgb.join(',')})`;$('rgb-value').textContent=`RGB(${rgb.join(', ')})`;const cells=$('pixel-grid').children;Array.from(cells).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));cells[selected].style.backgroundColor=`rgb(${rgb.join(',')})`;cells[selected].setAttribute('aria-label',`Fila ${Math.floor(selected/8)+1}, columna ${selected%8+1}: RGB ${rgb.join(', ')}`);}
['red','green','blue'].forEach(c=>$(c).addEventListener('input',updatePixel));$('reset-pixels').addEventListener('click',resetPixels);resetPixels();
/** Calculate raw RGB payload only; validate dimensions before multiplying. */
function calculateSize(){const w=Number($('width').value),h=Number($('height').value);if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>20000||h>20000){$('image-size').textContent='Ingresá enteros entre 1 y 20 000 px.';return;}const bytes=w*h*3;$('image-size').textContent=`${(bytes/1e6).toLocaleString('es-CR',{maximumFractionDigits:2})} MB · ${bytes.toLocaleString('es-CR')} bytes`;}
['width','height'].forEach(c=>$(c).addEventListener('input',calculateSize));calculateSize();
const questions=[
 {q:'¿Qué convierte un gráfico en parte de una historia de datos?',a:['Usar muchos colores.','Relacionar evidencia, contexto y una decisión.','Ocultar los resultados que no apoyan la idea.'],correct:1,why:'La historia conecta datos confiables con una pregunta relevante, una interpretación y un siguiente paso.'},
 {q:'Una tasa baja del 12 % al 3 %. ¿Cuál es la reducción relativa?',a:['9 %.','75 %.','3 %.'],correct:1,why:'(12 − 3) ÷ 12 × 100 = 75 %. La diferencia absoluta es de 9 puntos porcentuales.'},
 {q:'¿Qué gráfico ayuda a mostrar la evolución mensual?',a:['Un gráfico de líneas.','Una fotografía.','Una lista de colores sin etiquetas.'],correct:0,why:'Una línea comunica cambios entre observaciones ordenadas en el tiempo.'},
 {q:'En ETL, ¿qué sucede antes de cargar los datos al destino?',a:['Se borran todas las fuentes.','Se transforman los datos extraídos.','Se publica el gráfico sin validar.'],correct:1,why:'ETL significa extraer, transformar y cargar. En ELT la transformación ocurre después de cargar.'},
 {q:'¿Cuántos bytes usa un píxel RGB de 8 bits por canal sin compresión?',a:['1 byte.','8 bytes.','3 bytes.'],correct:2,why:'Tres canales × 8 bits = 24 bits; 24 ÷ 8 = 3 bytes por píxel.'}
];let current=0,score=0,answered=false;
/** Keep quiz state in memory and prevent scoring the same answer more than once. */
function showQuestion(){answered=false;const q=questions[current];$('question').textContent=q.q;$('answers').replaceChildren();q.a.forEach((text,i)=>{const label=document.createElement('label');const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.value=i;radio.required=true;label.append(radio,document.createTextNode(text));$('answers').append(label);});$('feedback').textContent='';$('quiz-submit').disabled=false;$('next').hidden=true;$('quiz-progress').textContent=`Pregunta ${current+1} de ${questions.length}`;}
$('quiz').addEventListener('submit',e=>{e.preventDefault();if(answered)return;const input=document.querySelector('input[name=answer]:checked');if(!input)return;answered=true;const q=questions[current],ok=Number(input.value)===q.correct;if(ok)score++;$('feedback').textContent=(ok?'¡Correcto! ':'La respuesta correcta es: '+q.a[q.correct]+' ')+q.why;$('quiz-submit').disabled=true;document.querySelectorAll('input[name=answer]').forEach(r=>r.disabled=true);$('next').hidden=false;$('next').textContent=current===questions.length-1?'Ver resultado →':'Siguiente pregunta →';});
$('next').addEventListener('click',()=>{if(current===questions.length){current=0;score=0;showQuestion();return;}current++;if(current<questions.length){showQuestion();$('question').focus();}else{$('question').textContent=`Tu resultado: ${score} de ${questions.length}`;$('answers').replaceChildren();$('feedback').textContent=score===5?'¡Excelente! Conectaste la historia, la visualización y la ingeniería.':'Volvé a explorar los laboratorios y probá de nuevo para reforzar lo aprendido.';$('quiz-submit').disabled=true;$('next').textContent='Intentar de nuevo ↻';$('quiz-progress').textContent='Reto completado';}});showQuestion();
