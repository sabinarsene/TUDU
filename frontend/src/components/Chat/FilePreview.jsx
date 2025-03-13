import React, { useState } from 'react';
import { Box, Image, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, Text, Progress } from '@chakra-ui/react';
import { FileIcon, DownloadIcon, EyeIcon } from 'lucide-react';

export const FilePreview = ({ file, metadata, onDownload }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await onDownload();
      setDownloading(false);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloading(false);
    }
  };

  const isImage = metadata?.type?.startsWith('image/');

  return (
    <Box>
      <Box 
        p={3} 
        borderWidth="1px" 
        borderRadius="md" 
        display="flex" 
        alignItems="center"
      >
        {isImage ? (
          <Image 
            src={file.url} 
            maxH="100px" 
            objectFit="contain" 
            cursor="pointer"
            onClick={() => setIsPreviewOpen(true)}
          />
        ) : (
          <FileIcon size={24} />
        )}
        
        <Box ml={3} flex="1">
          <Text fontSize="sm" fontWeight="medium">{metadata.name}</Text>
          <Text fontSize="xs" color="gray.500">
            {(metadata.size / 1024).toFixed(1)} KB
          </Text>
        </Box>

        <Button
          leftIcon={<DownloadIcon />}
          size="sm"
          onClick={handleDownload}
          isLoading={downloading}
        >
          Download
        </Button>
        
        {isImage && (
          <Button
            leftIcon={<EyeIcon />}
            size="sm"
            ml={2}
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview
          </Button>
        )}
      </Box>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{metadata.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image src={file.url} w="100%" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};