"use client";
import Loader from "@/Components/Loader/Loader";
import { TOKEN_NAME, TOKEN_NAME_REG } from "@/Until";
import { NewPassword, PasswordMatch, PasswordRequired, showError } from "@/Until/ValidationError";
import { useFormik } from "formik";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";
import "../FormStyle.css";
import "./authfields.css";
import Icon from "@/Components/ui/Icon";
import { changePasswordApi, resetPasswordApi } from "@/api/setting";
import { toast } from "react-toastify";

function ResetChangePasswordForm(props) {
  const { push } = useRouter();
  const [loading, setloading] = useState(false);
  const initialValues = {
    oldPassword: "",
    password: "",
    confirmPassword: "",
    toggle: false,
    toggle1: false,
    toggle2: false,
  };
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      oldPassword: props.page === "change" && PasswordRequired,
      password: NewPassword,
      confirmPassword: PasswordMatch,
    }),
    enableReinitialize: true,
    onSubmit: (values, { isSubmitting, resetForm }) => {
      setloading(true);

      const payload = {
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
        oldPassword: values.oldPassword,
      };
      if (props.page !== "change") {
        delete payload.oldPassword;
      }

      if (props.page === "change") {
        changePasswordApi(payload).then((res) => {
          if (res?.status === 1) {
            toast.success(res.message);
            Cookies.remove(TOKEN_NAME);
            push("/");
            setloading(false);
          } else {
            setloading(false);
            toast.error(res.message);
          }
        });
      } else {
        resetPasswordApi(payload).then((res) => {
          if (res?.status === 1) {
            toast.success(res.message);
            Cookies.remove(TOKEN_NAME_REG);
            push("/");
            setloading(false);
          } else {
            setloading(false);
            toast.error(res.message);
          }
        });
      }
    },
  });
  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      {props.page === "change" && (
        <div className="ab-field">
          <label htmlFor="ab-old-password" className="ab-label">
            Current password
          </label>
          <div className="ab-control ab-pw">
            <input
              id="ab-old-password"
              type={formik.values.toggle ? "text" : "password"}
              autoComplete="current-password"
              className="form-control"
              placeholder="Enter your current password"
              {...formik.getFieldProps("oldPassword")}
            />
            <button
              type="button"
              className="ab-pw__toggle"
              aria-label={formik.values.toggle ? "Hide password" : "Show password"}
              aria-pressed={formik.values.toggle}
              onClick={(e) => {
                e.preventDefault();
                formik.setFormikState((prevState) => {
                  return {
                    ...prevState,
                    values: {
                      ...prevState.values,
                      toggle: !prevState.values.toggle,
                    },
                  };
                });
              }}
            >
              <Icon name={formik.values.toggle ? "eyeOff" : "eye"} size={20} />
            </button>
          </div>
          {showError(formik, "oldPassword") && (
            <div className="ab-error" role="alert">
              {formik.errors.oldPassword}
            </div>
          )}
        </div>
      )}
      <div className="ab-field">
        <label htmlFor="ab-new-password" className="ab-label">
          New password
        </label>
        <div className="ab-control ab-pw">
          <input
            id="ab-new-password"
            type={formik.values.toggle1 ? "text" : "password"}
            autoComplete="new-password"
            className="form-control"
            placeholder="At least 8 characters"
            {...formik.getFieldProps("password")}
          />
          <button
            type="button"
            className="ab-pw__toggle"
            aria-label={formik.values.toggle1 ? "Hide password" : "Show password"}
            aria-pressed={formik.values.toggle1}
            onClick={(e) => {
              e.preventDefault();
              formik.setFormikState((prevState) => {
                return {
                  ...prevState,
                  values: {
                    ...prevState.values,
                    toggle1: !prevState.values.toggle1,
                  },
                };
              });
            }}
          >
            <Icon name={formik.values.toggle1 ? "eyeOff" : "eye"} size={20} />
          </button>
        </div>
        {showError(formik, "password") && (
          <div className="ab-error" role="alert">
            {formik.errors.password}
          </div>
        )}
      </div>
      <div className="ab-field">
        <label htmlFor="ab-confirm-password" className="ab-label">
          Confirm new password
        </label>
        <div className="ab-control ab-pw">
          <input
            id="ab-confirm-password"
            type={formik.values.toggle2 ? "text" : "password"}
            autoComplete="new-password"
            className="form-control"
            placeholder="Enter it again"
            {...formik.getFieldProps("confirmPassword")}
          />
          <button
            type="button"
            className="ab-pw__toggle"
            aria-label={formik.values.toggle2 ? "Hide password" : "Show password"}
            aria-pressed={formik.values.toggle2}
            onClick={(e) => {
              e.preventDefault();
              formik.setFormikState((prevState) => {
                return {
                  ...prevState,
                  values: {
                    ...prevState.values,
                    toggle2: !prevState.values.toggle2,
                  },
                };
              });
            }}
          >
            <Icon name={formik.values.toggle2 ? "eyeOff" : "eye"} size={20} />
          </button>
        </div>
        {showError(formik, "confirmPassword") && (
          <div className="ab-error" role="alert">
            {formik.errors.confirmPassword}
          </div>
        )}
      </div>
      <div className="ab-form-actions">
        <button
          type="submit"
          className="ab-btn ab-btn--primary ab-btn--lg ab-btn--block"
          aria-busy={loading}
        >
          {loading ? (
            <Loader color="#fff" />
          ) : props.page === "change" ? (
            "Change password"
          ) : (
            "Update password"
          )}
        </button>
      </div>
    </form>
  );
}

export default ResetChangePasswordForm;
