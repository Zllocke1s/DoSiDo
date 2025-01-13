import React, { useState } from 'react';
import { RequestType } from '../enums'; // Import the enum
import { CustomModal } from './CustomModal';

export const UsernameModal = ({ onClose }) => {

  const [name, setName] = React.useState("")

  return (
   <CustomModal title={"Create a username"} textValue={name} onTextInput={setName} onClose={() => {onClose(name)}} closeText={"Done"}></CustomModal>
  );
};
