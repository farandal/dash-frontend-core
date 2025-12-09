import { useEffect } from "react";
import { useListContext } from "react-admin";

const GetProductList = ({ setProd }) => {
  const { selectedIds, data, isLoading } = useListContext();

  useEffect(() => {
    if (!isLoading && data?.length) setProd(selectedIds);
  }, [selectedIds, isLoading, data]);

 

  return <></>;
};

export default GetProductList;