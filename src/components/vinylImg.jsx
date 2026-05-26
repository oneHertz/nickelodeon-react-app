import React from "react";

import { printVinyl } from "../vinyl";
import { useIsVisible } from "../useIsVisible";

import blankVinyl from "/vinyl_blank.jpg"

function VinylImg(props) {
    const [imgDataURL, setImgDataURL] = React.useState(blankVinyl);
    const [loadingInitiated, setLoadingInitiated] = React.useState(false);
    
    const imgTag = React.useRef();
    
    const isImgVisible = useIsVisible(imgTag);
    
    const getImgSrc = React.useCallback(() => {
        if (!loadingInitiated && isImgVisible) {
            setLoadingInitiated(true);
            (async () => {
                setImgDataURL(await printVinyl(props.id));
            })();
        }
        return imgDataURL;
    }, [loadingInitiated, isImgVisible, imgDataURL]);

    return (
        <img
            ref={imgTag}
            src={getImgSrc()}
            alt={`Cover for ${props.id}`}
            width={props.width}
            height={props.width}
            style={{ borderRadius: '50%' }}
            loading="lazy" />
    );
}

export default VinylImg;
  