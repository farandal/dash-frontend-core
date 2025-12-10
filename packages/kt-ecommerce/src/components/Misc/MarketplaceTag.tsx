import React, { useEffect, useState } from "react";

import { Avatar, Tooltip } from "@mui/material";
import { ISystemMarketplace } from "../../interfaces";

const checkIfImageExists = (path, callback) => {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = path;
		if (img.complete) {
			callback(true);
		} else {
			img.onload = () => {
				callback(true);
			};

			img.onerror = () => {
				callback(false);
			};
		}
	});
};

export interface IMarketplaceTag {
    marketplace: ISystemMarketplace;
    key?: number | string;
    noTitle?: boolean;
}

const MarketplaceTag: React.FC<IMarketplaceTag> = ({
    marketplace,
    noTitle = false,
    ...props
}) => {

    

    const [image, setImage] = useState<string>(null);

    const checkImage = async () => {
        await checkIfImageExists(marketplace?.icon_url, (exists) => {
            if (exists) {
                setImage(marketplace.icon_url);
            }
        });
    };

    useEffect(() => {
        checkImage();
    }, []);

 
    return (
        <div className="dash-campaign-tag" key={props?.key ?? 0}>
          
            {image ? (
                <Tooltip
                title={marketplace?.name}
              >
                <Avatar
                    sx={{ width: 24, height: 24 }}
                    src={image}
                    alt={marketplace?.name}
                />
                </Tooltip>
            ) : (
                <Tooltip
                title={marketplace?.name}
              >
                <Avatar alt={marketplace?.name} sx={{ width: 24, height: 24 }}>
                    {marketplace?.name?.toLowerCase().charAt(0)}
                </Avatar>
                </Tooltip>
            )}
            {!noTitle && (
                <span>
                    <strong style={{ textTransform: "capitalize" }}>
                        {marketplace?.name?.toLowerCase()}
                    </strong>
                </span>
            )}
        </div>
    );
};

export default MarketplaceTag;
