import React, { useState } from 'react';
import { RequestType } from '../enums'; // Import the enum
import { CustomModal } from './CustomModal';

export const RequestModal = ({ songId, isVisible, handleRequest, onClose }) => {

  

  return (
   <CustomModal title={"Request Song"} body={"Would you like this dance to be played or taught?"} options={[{label: "Play", value: RequestType.PLAY}, {label: "Teach", value: RequestType.TEACH}]} handleRequest={handleRequest} onClose={onClose}></CustomModal>
  );
};
