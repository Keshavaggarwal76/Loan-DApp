import className from "classnames";
import { useState } from "react";

function Button({
  children, // React children to be rendered within the button element
  cls, // Custom class to be applied to the button element
  id, // ID attribute for the button element
  disabled,
  type, // Type attribute for the button element (e.g. "submit", "reset")
  name, // Name attribute for the button element
  key, // Key attribute for the button element
  onClick = () => {}, // Function to be called when the button is clicked
  primary, // If true, applies the "btn-primary" class to the button element
  secondary, // If true, applies the "btn-secondary" class to the button element
  success, // If true, applies the "btn-success" class to the button element
  warning, // If true, applies the "btn-warning" class to the button element
  danger, // If true, applies the "btn-danger" class to the button element
  dark, // If true, applies the "btn-dark" class to the button element
  outline, // If true, applies the "btn-outline-*" class to the button element, depending on the value of the other variation props
}) {
  // Determine classes to be applied to the button element based on the values of the variation props and the outline prop
  const classes = className(cls, {
    "btn btn-primary": !outline && primary,
    "btn btn-secondary": !outline && secondary,
    "btn btn-success": !outline && success,
    "btn btn-warning": !outline && warning,
    "btn btn-danger": !outline && danger,
    "btn btn-dark": !outline && dark,
    "btn btn-outline-primary": outline,
    "btn btn-outline-secondary": outline && secondary,
    "btn btn-outline-success": outline && success,
    "btn btn-outline-warning": outline && warning,
    "btn btn-outline-danger": outline && danger,
    "btn btn-outline-dark": outline && dark,
  });

  // Use the useState hook to create a state variable for the button's style and a setter function for it
  const [style, setStyle] = useState({ boxShadow: "" });
  // Define a function that will be called when the button is clicked
  const onClicked = (e) => {
    // Remove the shadow from the button after 0.2 second (200 milliseconds)
    setTimeout(function () {
      setStyle({ boxShadow: "none" });
    }, 200);
    setStyle({ boxShadow: "" });
    // Call the onClick prop function
    onClick(e);
  };

  // Render the button element with the calculated classes and the state-controlled style
  return (
    <button
      className={classes}
      onClick={onClicked}
      id={id}
      type={type}
      name={name}
      key={key}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Add a propType check that ensures that only one of primary, secondary, success, warning, danger, dark is set to true
Button.propTypes = {
  checkVariationValue: ({ primary, secondary, success, warning, danger }) => {
    // Count the number of variation props that are set to true
    const count =
      Number(!!primary) +
      Number(!!secondary) +
      Number(!!warning) +
      Number(!!success) +
      Number(!!danger);

    // If more than one variation prop is set to true, return an error
    if (count > 1) {
      return new Error(
        "Only one of primary, secondary, success, warning, danger, dark can be true"
      );
    }
  },
};

// Export the Button component
export default Button;
