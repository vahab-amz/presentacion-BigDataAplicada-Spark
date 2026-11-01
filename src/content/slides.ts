import type { Speaker } from "../lib/deck/types";

export type { Speaker };

export type SlideComponentKey =
  | "Portada"
  | "NuestroTema"
  | "TablaInfinita"
  | "ConsultaStreaming"
  | "Microbatch"
  | "EventTime"
  | "Watermark"
  | "MllibPiezas"
  | "PipelineFraude"
  | "CasoDeUso"
  | "ViajePago"
  | "Resumen";

export interface SlideDef {
  id: number; // 1..12
  speaker: Speaker;
  title: string;
  steps: number;
  notes: string; // speaker notes, verbatim; "[→]" marks a step advance
  component: SlideComponentKey;
}

/** Marker used inside `notes` for a step advance. */
export const STEP_MARKER = "[→]";

export const slides: readonly SlideDef[] = [
  {
    id: 1,
    speaker: "Vau",
    title: "Spark en tiempo real",
    steps: 0,
    component: "Portada",
    notes: "Buenos días. Somos el Grupo 6, Vau y Onai.",
  },
  {
    id: 2,
    speaker: "Vau",
    title: "Nuestro tema",
    steps: 4,
    component: "NuestroTema",
    notes:
      "Nuestro tema son dos librerías construidas sobre los DataFrames: Structured Streaming, para datos en tiempo real, y MLlib, para Machine Learning. Responderemos tres preguntas: cómo funciona la tabla infinita, qué es el watermarking y cuáles son los componentes de MLlib. Terminaremos con un caso de uso real.",
  },
  {
    id: 3,
    speaker: "Vau",
    title: "El stream como tabla infinita",
    steps: 3,
    component: "TablaInfinita",
    notes:
      "Un stream es un flujo de eventos que nunca termina, como pagos o clics. [→] Structured Streaming lo trata como una tabla infinita: cada evento es una fila nueva que se añade al final. [→] Por eso podemos usar el mismo código de DataFrame o SQL que en batch. [→] Pero Spark no recalcula toda la tabla: guarda un estado con los resultados parciales y procesa solo los eventos nuevos, en pequeños lotes llamados micro-batches.",
  },
  {
    id: 4,
    speaker: "Vau",
    title: "Una consulta de streaming",
    steps: 3,
    component: "ConsultaStreaming",
    notes:
      "[→] Una consulta tiene una fuente, normalmente Kafka, una transformación y un destino. [→] El output mode decide qué se escribe: solo lo nuevo, solo lo que cambia o toda la tabla. [→] El checkpoint guarda el progreso y el estado: si la aplicación se cae, continúa donde lo dejó y cada evento cuenta exactamente una vez. Y desde Spark 4.1, el Real-Time Mode baja la latencia a milisegundos en consultas sin estado.",
  },
  {
    id: 5,
    speaker: "Vau",
    title: "Ejemplo: pagos cada 5 minutos",
    steps: 2,
    component: "Microbatch",
    notes:
      "Veámoslo con un ejemplo: contamos pagos en ventanas de cinco minutos. [→] En el primer micro-batch llegan pagos de las 12:01, 12:02 y 12:06: dos en la ventana de 12:00 a 12:05 y uno en la de 12:05 a 12:10. [→] En el segundo llega uno de las 12:07: Spark solo procesa ese pago, y la segunda ventana pasa a dos. En modo update, solo se escribe esa fila.",
  },
  {
    id: 6,
    speaker: "Vau",
    title: "Event time vs processing time",
    steps: 4,
    component: "EventTime",
    notes:
      "Pregunta dos. [→] Cada evento tiene dos tiempos: el event time, cuándo ocurrió de verdad, y el processing time, cuándo llegó a Spark. Analizamos por event time. Pero los datos pueden llegar tarde, por ejemplo desde un dispositivo sin conexión. [→] Para corregir una ventana, Spark guarda su estado en memoria; si guardara todas para siempre, la memoria crecería sin límite. [→] El watermark lo resuelve: se calcula como el event time máximo visto menos el umbral, y cuando supera el final de una ventana, esta se cierra y los datos posteriores se descartan. [→] Es un compromiso: un umbral grande da más precisión pero usa más memoria; uno pequeño, al revés.",
  },
  {
    id: 7,
    speaker: "Vau",
    title: "Watermark en acción",
    steps: 5,
    component: "Watermark",
    notes:
      "Veámoslo en directo, con ventanas de diez minutos y un umbral de diez. [→] Llega 12:04: entra en su ventana. [→] Llega 12:14: el watermark pasa a 12:04 y la ventana sigue abierta. [→] Llega tarde 12:07: se acepta. [→] Llega 12:25: el watermark sube a 12:15 y la ventana se cierra. [→] Y el de las 12:03 llega demasiado tarde: se descarta. (Tecla 1) Con un umbral de dos minutos, hasta el de las 12:07 se pierde. (Tecla 3) Con veinte, se cuentan todos, pero las ventanas ocupan memoria más tiempo. (Tecla 2) Hasta aquí, cómo procesar datos en tiempo real. Ahora Onai os explica cómo aprender de ellos con MLlib.",
  },
  {
    id: 8,
    speaker: "Onai",
    title: "MLlib: tres piezas",
    steps: 4,
    component: "MllibPiezas",
    notes:
      "Pregunta tres. MLlib es la librería de Machine Learning de Spark: distribuye el entrenamiento por el clúster, y su API actual es pyspark.ml, basada en DataFrames. Tiene tres componentes. [→] El Transformer, con transform, convierte un DataFrame en otro sin aprender nada. [→] El Estimator, con fit, aprende de los datos y devuelve un Transformer: el modelo entrenado. [→] Y el Pipeline encadena varias etapas. Es también un Estimator: al hacer fit, entrena cada etapa en orden y devuelve un PipelineModel que se guarda y se reutiliza. Así la preparación de los datos es la misma en entrenamiento y en producción. [→] Lo habitual es entrenar en batch y aplicar el modelo en streaming.",
  },
  {
    id: 9,
    speaker: "Onai",
    title: "Un Pipeline para fraude",
    steps: 4,
    component: "PipelineFraude",
    notes:
      "Un ejemplo para detectar fraude. [→] StringIndexer, un Estimator, convierte el país en un número. [→] VectorAssembler, un Transformer, junta el importe, la hora y el país en un vector. [→] Y RandomForestClassifier, un Estimator, aprende a detectar el fraude. [→] Con fit sobre el histórico obtenemos un PipelineModel que clasifica cada pago nuevo.",
  },
  {
    id: 10,
    speaker: "Onai",
    title: "Caso de uso: detección de fraude bancario",
    steps: 3,
    component: "CasoDeUso",
    notes:
      "Nuestro caso combina ETL batch, analítica predictiva y streaming. [→] La parte batch trabaja con el pasado: limpia el histórico, crea variables como la hora o el gasto medio del cliente en treinta días y entrena el Pipeline. Como el fraude es muy raro, alrededor del 0,1 %, damos más peso a los fraudes y no usamos la accuracy como métrica. [→] La parte streaming trabaja con el presente: los pagos llegan por Kafka, se unen al perfil del cliente y el modelo los clasifica. Además, una ventana deslizante con un watermark de diez minutos detecta más de cinco compras en dos minutos. [→] Las alertas van a una base de datos, con checkpoint para no perder ni duplicar ninguna.",
  },
  {
    id: 11,
    speaker: "Onai",
    title: "3:14 · el viaje de un pago",
    steps: 5,
    component: "ViajePago",
    notes:
      "Veámoslo en directo. [→] Son las 3:14 de la madrugada: alguien paga 900 euros en Brasil con la tarjeta de un cliente. [→] El pago entra por Kafka y se une a su perfil: gasta 45 euros de media, así que este pago es veinte veces su media. [→] El modelo lo clasifica como fraude y lanza una alerta, [→] y el cliente recibe un aviso al instante. [→] A la vez, la ventana detecta seis compras en dos minutos y lanza una segunda alerta. Todo en segundos.",
  },
  {
    id: 12,
    speaker: "Onai",
    title: "En resumen",
    steps: 3,
    component: "Resumen",
    notes:
      "[→] En resumen: Structured Streaming trata el tiempo real como una tabla infinita, [→] el watermark equilibra precisión y memoria con los datos tardíos, [→] y MLlib entrena en batch y aplica en streaming. Juntos hacen de Spark una única plataforma para analítica en tiempo real y predictiva. Gracias, ¿alguna pregunta?",
  },
];

/** steps per slide, index 0 = slide 1 (input for the pure navigation functions). */
export const STEPS_OF: readonly number[] = slides.map((s) => s.steps);

export const TOTAL_SLIDES = slides.length;

export function slideAt(slide: number): SlideDef {
  return slides[Math.min(Math.max(slide, 1), slides.length) - 1];
}

/** Splits notes into segments; segment k is what is said at step k. */
export function noteSegments(notes: string): string[] {
  return notes.split(STEP_MARKER).map((s) => s.trim());
}
