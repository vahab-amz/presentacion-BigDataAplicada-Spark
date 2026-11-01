"use client";

import { Save } from "lucide-react";
import { Card, Content, Pill, SlideTitle } from "@/components/ui/primitives";

/** M1 static version: final state (PipelineModel saved). */
export function PipelineFraude() {
  return (
    <>
      <SlideTitle>Un Pipeline para fraude</SlideTitle>
      <Content>
        <div className="font-mono text-data text-accent">pipeline.fit(histórico)</div>
        <Card tone="accent" className="mx-auto mt-[40px] flex w-[900px] items-center gap-[24px] p-[32px]">
          <Save size={48} className="text-accent" aria-hidden />
          <div>
            <div className="font-mono text-h3 font-semibold">PipelineModel</div>
            <div className="text-body text-muted">guardado · listo para streaming</div>
          </div>
        </Card>
        <Card className="mx-auto mt-[40px] w-[440px] p-[28px] font-mono text-data">
          <div>importe: 900</div>
          <div>hora: 3</div>
          <div>pais: &quot;BR&quot;</div>
          <div>pais_idx: 2</div>
          <div>features: [900, 3, 2]</div>
          <div>prediction: 1</div>
          <div>probabilidad 0,93</div>
          <div className="mt-[12px]">
            <Pill tone="bad">FRAUDE</Pill>
          </div>
        </Card>
      </Content>
    </>
  );
}
