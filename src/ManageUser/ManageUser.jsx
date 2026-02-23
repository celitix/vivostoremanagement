import React, { useEffect, useState } from "react";
import { MdOutlineDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import toast from "react-hot-toast";
import { Dialog } from "primereact/dialog";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { User, RefreshCw } from "lucide-react";
import { FaLink } from "react-icons/fa6";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";

import { QRCodeCanvas } from "qrcode.react";
import DataTable from "@/components/common/DataTable";
import UniversalButton from "@/components/common/UniversalButton";
import CustomTooltip from "@/components/common/CustomTooltip";
import InputField from "@/components/common/InputField";
import Capsule from "@/components/common/Capsule";
import UniversalSkeleton from "../components/ui/UniversalSkeleton";

import {
  getUserList,
  deleteUser,
  createUser,
  getUserUniqueTokenLink,
} from "@/apis/manageuser/manageuser";
import { updateUser } from "../apis/manageuser/manageuser";


const ManageUser = () => {
  const [usersListData, setUsersListData] = useState([]);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchData, setSearchData] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [userToken, setUserToken] = useState("");

  const [qrVisible, setQrVisible] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [qrStoreName, setQrStoreName] = useState("");


  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [addUser, setAddUser] = useState({
    name: "",
    storeName: ""
  });

  const handleAdd = () => {
    setEditMode(false);
    setEditData(null);
    setAddUser({ name: "", storeName: "" });
    setAddUserDialog(true);
  };

  const handleSaveUser = async () => {
    const { name, storeName } = addUser;

    if (!name) return toast.error("Please enter store name!");

    if (!storeName) return toast.error("storecode is required!");


    try {
      setLoadingAdd(true);
      let response;

      if (editMode) {
        const payload = {
          id: editData.id,
          storeName: storeName,
          name: name,
        };
        response = await updateUser(payload);
      } else {
        const payload = {
          storeName: storeName,
          name: name,
        };
        response = await createUser(payload);
      }

      if (response?.status) {
        toast.success(
          response?.message ||
          (editMode
            ? "Store updated successfully!"
            : "Store added successfully!")
        );
        fetchUserList();
        setAddUserDialog(false);
      } else {
        // toast.error(response?.message || "Failed to save store!");
        if (response?.message === "The store name has already been taken.") {
          toast.error("The store code has already been taken.");
        } else {
          toast.error(response?.message || "Failed to save store!");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while saving store.");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDelete = (row) => {
    setDeleteIsVisible(true);
    setSelectedUser(row);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await deleteUser(selectedUser.id);

      if (response?.status) {
        toast.success(response?.message || "Store deleted successfully!");
      } else {
        toast.error(response?.message || "Failed to delete store.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong while deleting store.");
    } finally {
      setDeleteIsVisible(false);
      fetchUserList();
      setSelectedUser(null);
    }
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setEditData(row);

    setAddUser({
      name: row.name || "",
      storeName: row.storeName || "",
    });
    setAddUserDialog(true);
  };

  const handleGenerateLink = async (row) => {
    try {
      const res = await getUserUniqueTokenLink(row.id);

      if (res?.token) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL_FRONTEND;
        const encodedName = encodeURIComponent(row.name);
        const shareableLink = `${baseUrl}/surveyform?token=${res.token}&name=${encodedName}`;

        setUserToken(res.token);
        setQrValue(shareableLink);
        setQrStoreName(row.storeName);
        setQrVisible(true);

        // if (navigator.clipboard && navigator.clipboard.writeText) {
        //   try {
        //     await navigator.clipboard.writeText(shareableLink);
        //     toast.success("Link copied to clipboard!");
        //   } catch (clipErr) {
        //     console.warn("Clipboard copy failed:", clipErr);
        //     toast.error(`Link generated: ${shareableLink}`);
        //     fallbackCopyTextToClipboard(shareableLink);
        //   }
        // } else {
        //   fallbackCopyTextToClipboard(shareableLink);
        // }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareableLink);
          toast.success("Link copied & QR Generated!");
        } else {
          fallbackCopyTextToClipboard(shareableLink);
        }
      } else {
        toast.error("Failed to generate token.");
      }
    } catch (error) {
      console.error("Error generating link:", error);
      toast.error("Something went wrong.");
    }
  };
  // const downloadQRCode = () => {
  //   const canvas = document.getElementById("store-qr-code");
  //   const pngUrl = canvas
  //     .toDataURL("image/png")
  //     .replace("image/png", "image/octet-stream");
  //   let downloadLink = document.createElement("a");
  //   downloadLink.href = pngUrl;
  //   downloadLink.download = `${qrStoreName}_QR.png`;
  //   document.body.appendChild(downloadLink);
  //   downloadLink.click();
  //   document.body.removeChild(downloadLink);
  // };

  const downloadQRCode = () => {
    const qrCanvas = document.getElementById("store-qr-code");
    if (!qrCanvas) return;

    // Create a new high-quality canvas for the download
    const downloadCanvas = document.createElement("canvas");
    const ctx = downloadCanvas.getContext("2d");

    // Set dimensions (QR size + space for store name only)
    const padding = 40;
    const textSpace = 60; // Reduced space since we only have one line of text
    downloadCanvas.width = qrCanvas.width + padding * 2;
    downloadCanvas.height = qrCanvas.height + padding * 2 + textSpace;

    // 1. Draw Background (White)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    // 2. Draw the QR Code from the original canvas
    ctx.drawImage(qrCanvas, padding, padding);

    // 3. Set Text Style
    ctx.fillStyle = "#1f2937"; // Dark gray
    ctx.textAlign = "center";

    // Draw Store Name (Bold/Large)
    ctx.font = "bold 24px Arial";
    ctx.fillText(
      qrStoreName,
      downloadCanvas.width / 2,
      qrCanvas.height + padding + 40
    );

    // 4. Generate Download
    const pngUrl = downloadCanvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${qrStoreName}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  // Fallback using execCommand (works in most browsers even without clipboard API)
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success("Link copied to clipboard!");
      } else {
        toast.warn("Copy failed. Please copy manually.");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      toast.error("Failed to copy link. Please copy manually.");
    }

    document.body.removeChild(textArea);
  }

  const manageUsersColumns = [
    { Header: "Sr No", accessor: "srno", width: 50, flex: 0 },
    { Header: "Created At", accessor: "created_at", minWidth: 180, flex: 1 },
    { Header: "Store Name", accessor: "name", minWidth: 150, flex: 1 },
    { Header: "Store Code", accessor: "storeName", minWidth: 180, flex: 1 },
    {
      Header: "Action",
      accessor: "action",
      width: 200,
      renderCell: ({ row }) => (
        <div className="flex gap-2 justify-start">
          <>
            <CustomTooltip arrow title="Edit Store Details" placement="top">
              <IconButton onClick={() => handleEdit(row)}>
                <EditNoteIcon sx={{ fontSize: "1.2rem", color: "gray" }} />
              </IconButton>
            </CustomTooltip>

            <CustomTooltip arrow title="Delete Store" placement="top">
              <IconButton onClick={() => handleDelete(row)}>
                <MdOutlineDeleteForever
                  className="text-red-500 cursor-pointer hover:text-red-600"
                  size={20}
                />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip arrow title="Store Unique Link" placement="top">
              <IconButton onClick={() => handleGenerateLink(row)}>
                <FaLink
                  className="text-blue-500 cursor-pointer hover:text-blue-600"
                  size={20}
                />
              </IconButton>
            </CustomTooltip>
          </>
        </div>
      ),
    },
  ];

  const fetchUserList = async () => {
    setSearchData(true);
    const data = {
      limit: "",
      page: "",
      orderBy: "",
    };
    try {
      const res = await getUserList(data);
      setUsersListData(res?.users);
    } catch (error) {
      console.log("error", error);
    } finally {
      setSearchData(false);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const manageUsersData = usersListData?.map((user, index) => ({
    srno: index + 1,
    id: user.id,
    created_at: moment(user?.created_at).format("DD-MM-YYYY HH:mm A") || "-",
    name: user.name,
    storeName: user.storeName,
  }));

  return (
    <>
      <div className="">
        <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-center text-center flex-wrap gap-4 md:flex-nowrap">
          <div
            className="mainlabel"
            style={{ width: "max-content !important" }}
          >
            Manage Store
          </div>
        </div>
        <div className="flex flex-wrap  gap-4 w-full items-end md:justify-between justify-center mb-3">
          <div className="w-max">
            <UniversalButton
              variant="secondary"
              label={searchData ? "Refreshing..." : "Refresh"}
              disabled={searchData}
              icon={<RefreshCw className={searchData ? "animate-spin scale-x-[-1]" : ""} size="18px" />}
              onClick={() => fetchUserList()}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-max">
              <UniversalButton
                variant="secondary"
                label="Create Store"
                onClick={handleAdd}
                className="text-nowrap"
              />
            </div>
            <Capsule
              icon={User}
              label="Total Stores"
              value={usersListData.length || 0}
              variant="secondary"
              className="text-nowrap"
            />
          </div>
        </div>

        {searchData ? (
          <UniversalSkeleton height="45rem" className="rounded-xl" />
        ) : (
          <div className="relative">
            <DataTable
              columns={manageUsersColumns}
              data={manageUsersData}
              loading={searchData}
              pageSize={15}
              showCheckbox={false}
              height="680px"
              showPageSizeDropdown={false}
            />
          </div>
        )}
      </div>

      {/* Add User Start */}
      <Dialog
        header={editMode ? "Edit Store" : "Add Store"}
        visible={addUserDialog}
        className="w-full md:w-200"
        onHide={() => {
          setAddUserDialog(false);
          setEditMode(false);
          setAddUser({ name: "", storeName: "" });
        }}
        draggable={false}
      >
        <div className="space-y-4 w-full">
          <div className="">
            <div className="space-y-4">
              <div className="flex flex-col flex-wrap gap-3">
                <div className="flex flex-col items-center gap-3">
                  <InputField
                    label="Store Name"
                    placeholder="Enter store name"
                    value={addUser.name}
                    onChange={(e) =>
                      setAddUser((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                  <InputField
                    label="Store Code"
                    placeholder="Enter Store Code"
                    value={addUser.storeName}
                    onChange={(e) =>
                      setAddUser((prev) => ({
                        ...prev,
                        storeName: e.target.value,
                      }))
                    }
                  />

                </div>
              </div>
              <div className="flex justify-center">
                <UniversalButton
                  label={
                    loadingAdd
                      ? editMode
                        ? "Updating..."
                        : "Saving..."
                      : editMode
                        ? "Update Store"
                        : "Save Store"
                  }
                  onClick={handleSaveUser}
                  disabled={loadingAdd}
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
      {/* Add User End */}

      {/* Delete User Start */}
      <Dialog
        header="Confirm Delete"
        visible={deleteIsVisible}
        onHide={() => setDeleteIsVisible(false)}
        className="w-full md:w-120"
        draggable={false}
      >
        <div className="flex flex-col items-center justify-center text-center px-4 py-3">
          <CancelOutlinedIcon sx={{ fontSize: 64, color: "#f44336", mb: 1 }} />

          <h2 className="text-[1.15rem] font-semibold text-gray-700 mb-2">
            Delete Store
          </h2>

          <p className="text-gray-600 text-sm mb-4">
            You are about to delete the store:
          </p>

          <div className="bg-gray-100 text-gray-800 font-medium rounded-md px-3 py-2 mb-4 w-full text-center break-words">
            {selectedUser?.storeName || "Unnamed Store"}
          </div>

          <p className="text-gray-500 text-sm">
            This action is{" "}
            <span className="font-semibold text-red-600">permanent</span> and
            cannot be undone.
          </p>

          <div className="flex justify-center gap-4 mt-5">
            <UniversalButton
              label="Cancel"
              style={{
                backgroundColor: "#4b5563",
              }}
              onClick={() => setDeleteIsVisible(false)}
            />
            <UniversalButton
              label="Delete"
              style={{
                backgroundColor: "#dc2626",
              }}
              onClick={() => {
                handleConfirmDelete();
                setDeleteIsVisible(false);
              }}
            />
          </div>
        </div>
      </Dialog>
      {/* Delete User End */}

      {/* QR Code Dialog Start */}
      <Dialog
        header="Store QR Code"
        visible={qrVisible}
        onHide={() => setQrVisible(false)}
        className="w-full md:w-96"
        draggable={false}
      >
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-2 rounded-lg shadow-sm border mb-4">
            <QRCodeCanvas
              id="store-qr-code"
              value={qrValue}
              size={250}
              level={"H"}
              includeMargin={false}
            />
          </div>

          <h3 className="font-bold text-lg text-gray-800 mb-1">{qrStoreName}</h3>
          <p className="text-xs text-gray-500 mb-6 break-all text-center px-4">
            {qrValue}
          </p>

          <div className="flex gap-3 w-full">
            <UniversalButton
              label="Close"
              variant="secondary"
              className="w-full"
              onClick={() => setQrVisible(false)}
            />
            <UniversalButton
              label="Download QR"
              className="w-full"
              onClick={downloadQRCode}
            />
          </div>
        </div>
      </Dialog>
      {/* QR Code Dialog End */}
    </>
  );
};

export default ManageUser;
