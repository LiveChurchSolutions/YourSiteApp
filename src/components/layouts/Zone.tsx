import { Section } from "@/components/Section";
import { ArrayHelper, ChurchInterface, SectionInterface } from "@/helpers";

type Props = {
  church: ChurchInterface,
  sections: SectionInterface[],
  zone: string;
};

export default function Zone(props: Props) {
  const result: JSX.Element[] = []
  let first = true;
  const sections = ArrayHelper.getAll(props.sections, "zone", props.zone);
  for (let section of sections) {
    result.push(<Section key={section.id} section={section} first={first} churchId={props.church.id} />)
    first = false;
  }
  return <>{result}</>;
}

