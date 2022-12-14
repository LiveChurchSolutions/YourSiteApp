import { ElementInterface } from "@/helpers";
import { Element } from "../Element";

interface Props {
  element: ElementInterface;
}

const getChildren = (elements: ElementInterface[]) => {
  const result: JSX.Element[] = []
  elements?.forEach(c => {
    result.push(<Element element={c} />)
  });
  return result;
}

export const ElementBlock: React.FC<Props> = (props) => {
  let result = <>
    Element Block - **TODO: Implement**
    {getChildren(props.element.elements)}
  </>;
  return result;
};
