import { CSSProperties, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Wrapper } from "@/components/Wrapper";
import { Grid } from "@mui/material";
import { ApiHelper, ConfigHelper, ElementInterface, PageInterface, SectionInterface, UserHelper, WrapperPageProps } from "@/helpers";
import { DisplayBox } from "@/components";
import { Section } from "@/components/Section";
import { SectionEdit } from "@/components/admin/SectionEdit";
import { ElementEdit } from "@/components/admin/ElementEdit";
import { ElementAdd } from "@/components/admin/ElementAdd";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import React from "react";
import { DroppableArea } from "@/components/admin/DroppableArea";
import { SectionBlock } from "@/components/SectionBlock";
import { GetStaticPaths, GetStaticProps } from "next";


export default function Admin(props: WrapperPageProps) {
  const { isAuthenticated } = ApiHelper
  const router = useRouter();
  const [page, setPage] = useState<PageInterface>(null);
  const [editSection, setEditSection] = useState<SectionInterface>(null);
  const [editElement, setEditElement] = useState<ElementInterface>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const id = router.query.id?.toString() || "";

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); }
  }, []);

  const loadData = () => {
    if (isAuthenticated) ApiHelper.get("/pages/" + UserHelper.currentUserChurch.church.id + "/tree?id=" + id, "ContentApi").then(p => setPage(p));
  }

  useEffect(loadData, [id]);

  const handleDrop = (data: any, sort: number) => {
    if (data.data) {
      const section: SectionInterface = data.data;
      section.sort = sort;
      section.zone = "main";
      ApiHelper.post("/sections", [section], "ContentApi").then(() => { loadData() });
    }
    else {
      setEditSection({ sort, background: "#FFF", textColor: "light", pageId: id, targetBlockId: data.blockId });
    }
  }

  const getAddSection = (s: number) => {
    const sort = s;
    return (<DroppableArea accept={["section", "sectionBlock"]} onDrop={(data) => handleDrop(data, sort)} />);
    //return (<div style={{ textAlign: "center", background: "#EEE" }}><SmallButton icon="add" onClick={() => setEditSection({ sort, background: "#FFF", textColor: "light" })} toolTip="Add Section" /></div>)
  }

  const getSections = () => {
    const result: JSX.Element[] = []
    result.push(getAddSection(0));
    page?.sections.forEach(section => {
      if (section.targetBlockId) result.push(<SectionBlock section={section} onEdit={handleSectionEdit} onMove={() => { loadData() }} />)
      else result.push(<Section section={section} onEdit={handleSectionEdit} onMove={() => { loadData() }} />)
      result.push(getAddSection(section.sort + 0.1));
    });
    return result;
  }

  const handleSectionEdit = (s: SectionInterface, e: ElementInterface) => {
    if (s) setEditSection(s);
    else if (e) setEditElement(e);
  }

  const rightBarStyle: CSSProperties = (scrollTop < 180) ? {} : {
    width: document.getElementById("editorBar")?.clientWidth,
    position: "fixed",
    marginTop: -180
  };

  useEffect(() => {
    const onScroll = e => {
      setScrollTop(e.target.documentElement.scrollTop);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollTop]);

  const handleRealtimeChange = (element: ElementInterface) => {
    const p = { ...page };
    p.sections.forEach(s => {
      realtimeUpdateElement(element, s.elements);
    })
    setPage(p);
  }

  const realtimeUpdateElement = (element: ElementInterface, elements: ElementInterface[]) => {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].id === element.id) elements[i] = element;
      if (element.elements?.length > 0) realtimeUpdateElement(element, element.elements);
    }
  }

  return (
    <Wrapper config={props.config}>
      <h1>Edit Page</h1>
      <DndProvider backend={HTML5Backend}>
        <Grid container spacing={3}>
          <Grid item md={8} xs={12}>
            <DisplayBox headerText="Page Preview" headerIcon="article"  >
              <div id="page" style={{ height: 500, overflowY: "scroll" }}>
                {getSections()}
              </div>
            </DisplayBox>
          </Grid>
          <Grid item md={4} xs={12}>
            <div id="editorBar">
              <div style={rightBarStyle}>
                {!editSection && !editElement && <ElementAdd includeBlocks={true} includeSection={true} />}
                {editSection && <SectionEdit section={editSection} updatedCallback={() => { setEditSection(null); loadData(); }} />}
                {editElement && <ElementEdit element={editElement} updatedCallback={() => { setEditElement(null); loadData(); }} onRealtimeChange={handleRealtimeChange} />}
              </div>
            </div>
          </Grid>
        </Grid>
      </DndProvider>
    </Wrapper>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = [];
  return { paths, fallback: "blocking", };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const config = await ConfigHelper.load(params.sdSlug.toString());
  return { props: { config }, revalidate: 30 };
};