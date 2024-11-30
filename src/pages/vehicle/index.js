import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useEffect } from "react";
import { useToaster } from "@/hooks/useToaster";
import { useRouter } from "next/router";

const Vehicle = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToaster();

  const validationSchema = Yup.object({
    carModel: Yup.string()
      .min(3, "Car model must be at least 3 characters")
      .required("Car model is required"),
    price: Yup.number()
      .min(1, "Price must be greater than 0")
      .required("Price is required"),
    phone: Yup.string()
      .matches(
        /^0[1-3][0-9]{9}$/,
        "Phone number must be valid (e.g., 01123456789)"
      )
      .required("Phone number is required"),
    numberOfCopies: Yup.number()
      .required()
      .min(1, "Number of copies must be at least 1")
      .max(10, "Number of copies cannot exceed 10")
      .required("Number of copies is required"),
    pictures: Yup.array()
      .of(Yup.mixed().required("Image is required"))
      .test(
        "image-count",
        "Number of uploaded images must match the number of copies",
        function (value) {
          return value && value.length === this.parent.numberOfCopies;
        }
      ),
    city: Yup.string()
      .oneOf(["Lahore", "Karachi"], "Please select a valid city")
      .required("City is required"),
  });

  const handleFormSubmit = async (values) => {
    // Fetch token and userId from localStorage
    let userData = JSON.parse(localStorage.getItem("data"));
    const token = userData?.token;
    const userId = userData?.userId;

    // Check if the token and userId exist
    if (!token || !userId) {
      showError("Authorization failed. Please log in again.");
      router.push("/login");
      return;
    }

    const formData = new FormData();
    // Append other form values
    formData.append("carModel", values.carModel);
    formData.append("price", values.price);
    formData.append("phone", values.phone);
    formData.append("numberOfCopies", values.numberOfCopies);
    formData.append("city", values.city); // Add city to form data
    formData.append("userId", userId);

    // Append images to the form data
    values.pictures.forEach((image) => {
      formData.append("images", image); // 'images' is the field name in the backend for file upload
    });

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/vehicle`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        showSuccess("Vehicle information submitted successfully");
      }
    } catch (error) {
      console.log(error);
      showError(error?.response?.data?.error || error?.response?.data?.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("data");
    router.push("/login");
  };

  const checkAuth = () => {
    let data = localStorage.getItem("data");
    data = JSON.parse(data);
    if (!data?.token) {
      router.push("/login");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 bg-blue-600 text-white shadow-md">
        <div className="text-lg font-bold">
          <img
            src="/car.png"
            alt="Logo"
            className="invert"
            width={60}
            height={60}
          />
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-3xl font-bold text-blue-700 mb-6">
            Submit Vehicle Information
          </h2>
          <Formik
            initialValues={{
              carModel: "",
              price: "",
              phone: "",
              numberOfCopies: "",
              pictures: [],
              city: "Lahore",
            }}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ setFieldValue, isSubmitting, values }) => (
              <Form>
                <div className="mb-4">
                  <label
                    htmlFor="carModel"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Car Model
                  </label>
                  <Field
                    type="text"
                    id="carModel"
                    name="carModel"
                    className="mt-2 p-2 w-full border border-blue-300 rounded-md focus:outline-blue-500 text-black"
                  />
                  <ErrorMessage
                    name="carModel"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="price"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Price
                  </label>
                  <Field
                    type="number"
                    id="price"
                    name="price"
                    className="mt-2 p-2 w-full border border-blue-300 rounded-md focus:outline-blue-500 text-black"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </label>
                  <Field
                    type="text"
                    id="phone"
                    name="phone"
                    className="mt-2 p-2 w-full border border-blue-300 rounded-md focus:outline-blue-500 text-black"
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select City
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <Field
                        type="radio"
                        name="city"
                        value="Lahore"
                        className="text-blue-500"
                      />
                      <span className="text-black">Lahore</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Field
                        type="radio"
                        name="city"
                        value="Karachi"
                        className="text-blue-500"
                      />
                      <span className="text-black">Karachi</span>
                    </label>
                  </div>
                  <ErrorMessage
                    name="city"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="numberOfCopies"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Number of Copies
                  </label>
                  <Field
                    type="number"
                    id="numberOfCopies"
                    name="numberOfCopies"
                    className="mt-2 p-2 w-full border border-blue-300 rounded-md focus:outline-blue-500 text-black"
                  />
                  <ErrorMessage
                    name="numberOfCopies"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="pictures"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Upload Pictures
                  </label>
                  <input
                    type="file"
                    id="pictures"
                    name="pictures"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      // Convert the FileList to an array and set it in Formik's state
                      const files = Array.from(e.target.files);
                      setFieldValue("pictures", files); // This ensures that pictures is set as an array
                    }}
                    className="mt-2 p-2 w-full border border-blue-300 rounded-md focus:outline-blue-500"
                  />
                  <ErrorMessage
                    name="pictures"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {Array.from(values.pictures).map((image, index) => (
                      <div
                        key={index}
                        className="relative h-24 w-24 border border-gray-300 rounded-md"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Uploaded ${index}`}
                          className="h-full w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedImages = Array.from(
                              values.pictures
                            ).filter((_, i) => i !== index);
                            setFieldValue("pictures", updatedImages);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 focus:outline-none transition duration-300 ease-in-out"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 bg-blue-500 text-white p-2 rounded-md w-full hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Vehicle;
