import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import T from "i18n-react";

const useStyles = makeStyles((theme) => ({
  root: {
    // margin: "auto"
  },
  listItem: {
    padding: theme.spacing(1, 1),
  },
  userform: {
    // width: 400,
    // minHeight: 230,
    // backgroundColor: theme.palette.background.paper,
    // overflow: "auto",
    padding: "20px",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  titleCard: {
    display: "flex",
    padding: "10px",
    alignItems: "center",
    marginBottom: "10px",
    // backgroundColor: "dodgerblue",
    backgroundColor: "lightgray",
    // color: "white"
  },
}));

const Profile = ({ user, handleAccountChange }) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.userform}>
        <ValidatorForm
          noValidate
          autoComplete="off"
          onSubmit={() => {}}
          onError={(errors) => console.log(errors)}
        >
          <div className="row">
            <div className="col-md-12">
              <TextValidator
                // autoFocus
                required
                margin="dense"
                id="username"
                name="Email"
                value={user.metadata.name}
                label="Email"
                fullWidth
                disabled={!!user.metadata.id}
                validators={["required", "isEmail"]}
                errorMessages={["this field is required", "email is not valid"]}
              />
            </div>

            {
              <>
                <div className="col-md-6">
                  <TextValidator
                    required
                    margin="dense"
                    id="first_name"
                    name="First Name"
                    value={user.spec.firstName}
                    label="First Name"
                    onChange={handleAccountChange("first_name")}
                    fullWidth
                    validators={["required"]}
                    errorMessages={["this field is required"]}
                  />
                </div>
                <div className="col-md-6">
                  <TextValidator
                    required
                    margin="dense"
                    id="last_name"
                    name="Last Name"
                    value={user.spec.lastName}
                    label="Last Name"
                    onChange={handleAccountChange("last_name")}
                    fullWidth
                    validators={["required"]}
                    errorMessages={["this field is required"]}
                  />
                </div>

                <div className="col-md-6">
                  <TextValidator
                    margin="dense"
                    id="phone"
                    name="Phone"
                    value={user.spec.phone}
                    label="Phone"
                    onChange={handleAccountChange("phone")}
                    fullWidth
                    // validators={["required"]}
                    // errorMessages={["this field is required"]}
                  />
                </div>
                <div className="col-md-6" />
              </>
            }
          </div>
        </ValidatorForm>
      </div>
    </>
  );
};

export default Profile;
