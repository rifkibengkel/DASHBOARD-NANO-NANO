import React from "react";
import dynamic from "next/dynamic";
const Viewer = dynamic(() => import("react-viewer"), {ssr: false})

const Viewerjs = (props: any) => {
  const images: any = props?.url || [{src: ''}];

  return (
    <Viewer
      zIndex={0}
      visible={true}
      disableKeyboardSupport={true}
      // noResetZoomAfterChange={true}
      images={images}
      container={props.container}
    />
  );
}

export default React.memo(Viewerjs);
