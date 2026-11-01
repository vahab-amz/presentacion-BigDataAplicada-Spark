import type { ComponentType } from "react";
import type { SlideComponentKey } from "@/content/slides";
import { CasoDeUso } from "./CasoDeUso";
import { ConsultaStreaming } from "./ConsultaStreaming";
import { EventTime } from "./EventTime";
import { Microbatch } from "./Microbatch";
import { MllibPiezas } from "./MllibPiezas";
import { NuestroTema } from "./NuestroTema";
import { PipelineFraude } from "./PipelineFraude";
import { Portada } from "./Portada";
import { Resumen } from "./Resumen";
import { TablaInfinita } from "./TablaInfinita";
import type { SlideProps } from "./types";
import { ViajePago } from "./ViajePago";
import { Watermark } from "./Watermark";

export const SLIDE_COMPONENTS: Record<SlideComponentKey, ComponentType<SlideProps>> = {
  Portada,
  NuestroTema,
  TablaInfinita,
  ConsultaStreaming,
  Microbatch,
  EventTime,
  Watermark,
  MllibPiezas,
  PipelineFraude,
  CasoDeUso,
  ViajePago,
  Resumen,
};
