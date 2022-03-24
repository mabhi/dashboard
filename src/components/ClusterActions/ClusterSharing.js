import React, { useEffect, useState } from "react";
import { CircularProgress, Button } from "@material-ui/core";
import { useSelector } from "react-redux";
import ResourceSharingComp from "components/ResourceSharing/ResourceSharingComp";
import RadioField from "components/FormFields/RadioField";
import {
  assignProjectToCluster,
  unassignProjectFromCluster,
} from "actions/index";
import { parseError, useSnack } from "utils";

const ClusterSharing = ({ edge, onClose }) => {
  if (!edge) return null;
  const projects = useSelector((state) => state?.Projects);
  const currentProject = projects?.currentProject;
  const shareMode = edge?.cluster?.spec?.shareMode;
  const { showSnack } = useSnack();

  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [addedProjectList, setAddedProjectList] = useState([]);
  const [removedProjectList, setRemovedProjectList] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [currentProjects, setCurrentProjects] = useState([]);
  const [sharingType, setSharingType] = useState("none");

  const projectsList = projects?.projectsList?.results
    ?.filter((p) => p.id !== currentProject.id)
    .map((p) => {
      return {
        label: p.name,
        id: p.id,
        checked: false,
      };
    });

  const sharingDesc = {
    none: "Cluster sharing disabled across all other projects.",
    shareAll: "Cluster shared along all the projects",
    specific: "Cluster shared along specific projects",
  };

  const intiateSharetype = () => {
    const list = edge?.projects;

    if (shareMode === "ALL") setSharingType("shareAll");
    if (list?.length > 1 && shareMode === "CUSTOM") setSharingType("specific");
  };

  const getProjectID = (label) => {
    const project = projects?.projectsList?.results?.find(
      (p) => p.name === label
    );
    return project?.id || null;
  };

  const assignUnassignPayload = (list) => {
    return list.map((p) => {
      return {
        project_id: getProjectID(p),
      };
    });
  };

  const assignUnassign = (promise) => {
    return promise
      ?.then((_) => {
        setSaving(false);
        onClose();
      })
      .catch((error) => {
        setSaving(false);
        showSnack(parseError(error));
      });
  };

  const clusterSharingSaveConfirmPromise = () => {
    setSaving(true);
    setConfirmRemove(false);
    const promises = [];
    const payload = {
      shareMode: "CUSTOM",
    };

    if (addedProjectList.length > 0) {
      payload.projects = assignUnassignPayload(addedProjectList);
      promises.push(
        assignProjectToCluster(edge.id, payload, currentProject.id)
      );
    }
    if (removedProjectList?.length > 0) {
      payload.projects = assignUnassignPayload(removedProjectList);
      promises.push(
        unassignProjectFromCluster(edge.id, payload, currentProject.id)
      );
    }

    return Promise.all(promises);
  };

  const handleSetSelectedProjects = (data) => {
    setSelectedProjects(data);
    const getAddedList = data.filter((p) => !currentProjects.includes(p)) || [];
    const getRemovedList =
      currentProjects.filter((p) => !data.includes(p)) || [];

    setRemovedProjectList(getRemovedList);
    setAddedProjectList(getAddedList);
  };

  const clusterSharingSave = () => {
    let assignUnassignPromise;

    if (sharingType === "specific") {
      if (removedProjectList?.length > 0) {
        setConfirmRemove(true);
        return null;
      }
      assignUnassignPromise = clusterSharingSaveConfirmPromise();
    } else if (sharingType === "none") {
      assignUnassignPromise = unassignProjectFromCluster(
        edge.id,
        { shareMode: "ALL" },
        currentProject.id
      );
    } else if (sharingType === "shareAll") {
      assignUnassignPromise = assignProjectToCluster(
        edge.id,
        { shareMode: "ALL" },
        currentProject.id
      );
    }

    return assignUnassign(assignUnassignPromise);
  };

  const clusterSharingSaveConfirm = () => {
    const promise = clusterSharingSaveConfirmPromise();
    return assignUnassign(promise);
  };

  const getClusterName = (id) => {
    const proj = projects?.projectsList?.results?.find((p) => p.id === id);
    return proj?.name || null;
  };

  const setSelected = () => {
    if (sharingType === "specific") {
      const newProjects = edge?.projects
        ?.filter((p) => p.project_id !== currentProject.id)
        .map((p) => getClusterName(p.project_id));

      setSelectedProjects(newProjects);
      setCurrentProjects(newProjects);
    }
  };

  useEffect((_) => {
    intiateSharetype();
    setSelected();
  }, []);

  useEffect(() => {
    setSelected();
  }, [sharingType]);

  const content = saving ? (
    <CircularProgress size={50} className="cluster-action-loading" />
  ) : confirmRemove ? (
    <>
      <h2
        className="text-center"
        style={{ marginTop: "60px", marginBottom: "30px" }}
      >
        Please make sure you have unpublished all the workloads in projects: [
        <b className="text-danger mx-2">
          {removedProjectList.map((p) => p).join(", ")}
        </b>
        ] published to this cluster.
      </h2>
      <h1 className="text-center" style={{ marginBottom: "60px" }}>
        Are you sure you want to proceed?
      </h1>
    </>
  ) : (
    <>
      <div style={{ marginLeft: "50px" }}>
        <RadioField
          value={sharingType}
          className="mt-0"
          onChange={(e) => setSharingType(e.target.value)}
          items={[
            { value: "none", label: "None" },
            { value: "shareAll", label: "All Projects" },
            { value: "specific", label: "Specific Projects" },
          ]}
        />
        <p className="text-muted mt-2">{sharingDesc[sharingType]}</p>
      </div>
      {sharingType === "specific" && (
        <ResourceSharingComp
          projectsList={projectsList}
          selectedProjects={selectedProjects}
          setSelectedProjects={handleSetSelectedProjects}
        />
      )}
    </>
  );

  const buttons = [<Button onClick={onClose}>CANCEL</Button>];
  const saveButton = confirmRemove ? (
    <Button onClick={clusterSharingSaveConfirm} color="primary">
      YES
    </Button>
  ) : (
    <Button onClick={clusterSharingSave} color="primary">
      SAVE
    </Button>
  );

  buttons.push(saveButton);
  return (
    <>
      {content}
      <div className="row float-right mt-4">{buttons}</div>
    </>
  );
};

export default ClusterSharing;
