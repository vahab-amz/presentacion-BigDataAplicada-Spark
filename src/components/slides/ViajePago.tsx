"use client";

import { Card, Content, Pill, SlideTitle } from "@/components/ui/primitives";

/** M1 static version: final state of the journey. */
export function ViajePago() {
  return (
    <>
      <SlideTitle>3:14 · el viaje de un pago</SlideTitle>
      <Content className="grid grid-cols-3 gap-[40px]">
        <Card className="p-[28px] font-mono text-data">
          <div className="font-sans text-caption uppercase text-muted">Kafka · topic pagos</div>
          <div className="mt-[16px]">
            03:13:52 · 12,40 € · ES <span className="text-ok">OK</span>
          </div>
          <div>
            03:13:58 · 4,10 € · ES <span className="text-ok">OK</span>
          </div>
          <div>
            03:14:05 · 31,00 € · ES <span className="text-ok">OK</span>
          </div>
          <div className="mt-[16px] text-accent">
            03:14:20 · 900 € · BR
            <br />
            tarjeta ****4821
          </div>
        </Card>
        <div className="flex flex-col gap-[24px]">
          <Card tone="accent" className="p-[28px] text-body">
            Join perfil del cliente
            <div className="font-mono text-data text-muted">gasto medio: 45 € · ratio ×20</div>
          </Card>
          <Card tone="accent" className="p-[28px] text-body">
            Modelo
            <div className="font-mono text-h3">0,93</div>
          </Card>
          <Pill tone="bad">ALERTA #1 · modelo</Pill>
          <Pill tone="bad">ALERTA #2 · ventana 2 min</Pill>
        </div>
        <Card className="p-[28px]">
          <div className="text-body font-semibold">Banco Demo</div>
          <div className="text-body">¿Has realizado este pago de 900 € en Brasil?</div>
          <div className="mt-[16px] flex gap-[12px]">
            <Pill tone="ok">Sí, fui yo</Pill>
            <Pill tone="bad">No, bloquear tarjeta</Pill>
          </div>
          <div className="mt-[24px] font-mono text-data text-accent">Detectado en 1,8 s</div>
        </Card>
      </Content>
      <div className="absolute bottom-[36px] right-[260px] text-caption text-muted">Simulación</div>
    </>
  );
}
