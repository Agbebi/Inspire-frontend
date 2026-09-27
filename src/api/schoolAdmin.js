import API from "@/api/axios";

const schoolAdminAPI = {
  uploadLogo(file) {
    const formData = new FormData();
    formData.append("logo", file);
    return API.post("/api/school/manage/settings/upload-logo", formData);
  },
};

export default schoolAdminAPI;
