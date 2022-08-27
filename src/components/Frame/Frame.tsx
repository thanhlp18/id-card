import { Stage, Layer, Image as KonvaImage, Text, Group, Rect } from 'react-konva';
import frame from 'assets/images/id-card.svg';
import useImage from 'use-image';
import styled from 'styled-components';
import React, { useEffect, useMemo, useRef, useState, WheelEventHandler } from 'react';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Divider, Slider } from 'antd';

const IMAGE_WIDTH = 946;
const IMAGE_HEIGHT = 1300;

const Wrapper = styled.div`
  position: relative;

  &::after {
    content: "";
    display: block;
    padding-top: calc(1300 / 946 * 100%);
  }

  .konvajs-content {
    position: initial !important;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;

    > canvas {
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
    }
  }
`

type FrameProps = {
  name: string,
  image: HTMLImageElement | null
}
const Frame = React.forwardRef<Konva.Stage, FrameProps>(({
  name,
  image
}, ref) => {
  const [scale, setScale] = useState<number>(1);
  const [frameUrl] = useImage(frame);
  const parentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<Konva.Image>(null);
  const isDragging = useRef<boolean>(false);
  const initialPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setScale(1);
  }, [image]);

  const ratio = useMemo(() => {
    return parentRef.current ? parentRef.current.clientWidth / IMAGE_WIDTH : 1;
  }, [parentRef.current]);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      img.scale({ x: scale, y: scale });
    }
  }, [scale])

  function onMouseDown(e: KonvaEventObject<MouseEvent | TouchEvent>) {
    const clientX = e.type === "mousedown" ? (e as KonvaEventObject<MouseEvent>).evt.x : (e as KonvaEventObject<TouchEvent>).evt.touches[0].clientX;
    const clientY = e.type === "mousedown" ? (e as KonvaEventObject<MouseEvent>).evt.y : (e as KonvaEventObject<TouchEvent>).evt.touches[0].clientY;
    if (imageRef.current) {
      initialPos.current = {
        x: clientX - imageRef.current.x() * ratio,
        y: clientY - imageRef.current.y() * ratio
      };
      isDragging.current = true;
      document.onmousemove = onMouseMove;
      document.ontouchmove = onMouseMove;

      document.onmouseup = onMouseUp;
      document.ontouchend = onMouseUp;

    }

  }

  function onMouseMove(e: MouseEvent | TouchEvent) {

    if (imageRef.current && isDragging.current) {
      const clientX = e.type === "mousemove" ? (e as MouseEvent).clientX : (e as TouchEvent).touches[0].clientX;
      const clientY = e.type === "mousemove" ? (e as MouseEvent).clientY : (e as TouchEvent).touches[0].clientY;
      const img = imageRef.current;
      const dx = clientX - initialPos.current.x;
      const dy = clientY - initialPos.current.y;

      img.x((img.offsetX() + dx) / ratio);
      img.y((img.offsetY() + dy) / ratio);
    }
  }

  function onMouseUp(e: MouseEvent | TouchEvent) {
    // Touch end event doesn't have position
    const clientX = e.type === "mouseup" ? (e as MouseEvent).clientX : 0;
    const clientY = e.type === "mouseup" ? (e as MouseEvent).clientY : 0;
    initialPos.current = { x: clientX * ratio, y: clientY * ratio };
    isDragging.current = false;
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    const wheelDelta = e.nativeEvent.deltaY / Math.abs(e.nativeEvent.deltaY);
    setScale(prevScale => prevScale + 0.025 * wheelDelta)
  }

  return (
    <div>
      <Wrapper ref={parentRef} onWheel={onWheel}>
        <Stage
          ref={ref}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        >
          <Layer>
            <Rect width={IMAGE_WIDTH} height={IMAGE_HEIGHT} fill="#ffffff" />
          </Layer>
          <Layer>
            <KonvaImage
              image={frameUrl}
              onMouseDown={onMouseDown}
              onTouchStart={onMouseDown}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              x={0} y={0}
            />
          </Layer>

          <Layer>
            <Group clipFunc={(ctx: any) => {
              ctx.arc(472, 567, 247, 0, Math.PI * 2, false)
            }}>
              {image &&
                <KonvaImage
                  ref={imageRef}
                  image={image}
                  onMouseDown={onMouseDown}
                  onTouchStart={onMouseDown}
                />
              }
            </Group>
          </Layer>
          <Layer>
            <Text
              x={0}
              width={946}
              y={1000}
              text={name}
              fill="#FAEE65"
              fontSize={72}
              align="center"
              fontFamily="VL Selphia"
            />
          </Layer>
        </Stage>
      </Wrapper >
      <Divider />
      <p>Phóng to</p>
      <Slider defaultValue={1} value={scale} min={0} max={2} step={0.025} onChange={(value) => setScale(value)} />
    </div>
  )
})

Frame.displayName = "Frame";
export default Frame;