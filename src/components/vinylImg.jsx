import React from "react";
import { printVinyl } from "../vinyl";
import blankVinyl from "../vinyl_blank.jpg"
function VinylImg(props) {
    const [img, setImg] = React.useState();
    const imgtag = React.useRef()

    React.useEffect(() => {
        (async () => setImg(await printVinyl(props.id)))();
    }, []);

    return (
        <img ref={imgtag} src={img ?? blankVinyl} alt="Vinyl" width={props.width} loading="lazy"/>
    );
}

export default VinylImg;
  