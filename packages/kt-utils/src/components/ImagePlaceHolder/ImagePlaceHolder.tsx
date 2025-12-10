import { Tooltip } from "@mui/material";
import checkIfImageExists from "./checkIfImageExists";
import { HtmlHTMLAttributes, JSX, useEffect, useState } from "react";

type IImagePlaceHolder = {
    loading?: JSX.Element
    placeHolder?: JSX.Element | string
    src: string,
    alt?: string,
    title?: string
} & HtmlHTMLAttributes<HTMLDivElement>

const ImagePlaceHolder: React.FC<IImagePlaceHolder> = ({
    placeHolder = null,
    src,
    alt = "",
    loading = null,
    ...props
}) => {

    const [image, setImage] = useState<string>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkImage = async () => {
        setIsLoading(true);
        await checkIfImageExists(src, (exists) => {
            if (exists) {
                setImage(src);
            }
            setIsLoading(false);
        });
    };

    useEffect(() => {
        checkImage();
    }, []);

    if (isLoading && loading) {
        return loading;
    }

    return (
        <div {...props} >
            {image ? (
                <Tooltip title={alt} >
                    <img src={image} alt={alt} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </Tooltip>
            ) : (
                <Tooltip
                    title={alt}
                >
                    { typeof placeHolder === "string" ? <img src={placeHolder} alt={alt} style={{ objectFit: 'cover', width: '100%', height: '100%' }} /> : placeHolder}
                </Tooltip>
            )}
        </div>
    );
};

export default ImagePlaceHolder;