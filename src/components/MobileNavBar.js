import * as React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { MdFolder, MdRestore, MdFavoriteBorder, MdLocationPin   } from "react-icons/md";


export default function MobileNavBar({ userData, navigate }) {
  const [value, setValue] = React.useState("recents");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <BottomNavigation sx={{ width: 500 }} value={value} onChange={handleChange}>
      <BottomNavigationAction
        label="Recents"
        value="recents"
        icon={<MdRestore />}
      />
      <BottomNavigationAction
        label="Favorites"
        value="favorites"
        icon={<MdFavoriteBorder />}
      />
      <BottomNavigationAction
        label="Nearby"
        value="nearby"
        icon={<MdLocationPin />}
      />
      <BottomNavigationAction
        label="Folder"
        value="folder"
        icon={<MdFolder />}
      />
    </BottomNavigation>
  );
}
