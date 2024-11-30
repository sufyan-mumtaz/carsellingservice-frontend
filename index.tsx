'use client';
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import Image from 'next/image';
import Cards from './Cards';
import { Stepper, Step, StepLabel, StepContent, Tooltip } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import { stepperStyled } from './styles';
import useToaster from '@/hooks/useToaster';
import Loader from '@/components/Loader';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/slices/auth/selectors';
import BasicModal from './Modal';
import DeleteModal from '@/components/DeleteModal';
import Link from 'next/link';
import useApiHook from '@/hooks/useApiHook';
import { getFileNameFromUrl } from './MediaImages';
const DigitalHuman: React.FC = () => {
  const { handleApiCall, isApiLoading } = useApiHook();
  const [deleteId, setDeleteId] = React.useState('');
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const handleDeleteModalOpen = () => setOpenDeleteModal(true);
  const handleDeleteModalClose = () => setOpenDeleteModal(false);
  const auth = useSelector(selectAuth);
  const token = auth?.otpData?.data?.accessToken;
  const { _id = '', email = '', firstName = '', lastName = '' } = auth?.userInfo?.user || {};
  const user: any = { _id, email, name: `${firstName} ${lastName}` };
  const { showSuccessToast, showErrorToast } = useToaster();
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [media, setMedia] = useState('images');
  const [image, setImage] = useState<any>(null);
  const [audio, setAudio] = useState<any>(null);
  const [imageLibrary, setImageLibrary] = useState([]);
  const [audioLibrary, setAudioLibrary] = useState([]);
  const [script, setScript]: any = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<any>(null);
  const [uploadVoice, setUploadVoice] = useState<any>(null);
  const [uploadScript, setUploadScript]: any = useState<string | null>(null);
  const [jobData, setJobData] = useState<any>([]);
  const [value, setValue] = React.useState('1');
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [isAudioUploaded, setIsAudioUploaded] = useState(false);
  const [isScriptUploaded, setIsScriptUploaded] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const audioRef: any = useRef(null);

  interface IconComponentProps {
    color: string;
  }

  const IconComponent: React.FC<IconComponentProps> = ({ color }) => {
    return (
      <div className={`flex justify-center items-center text-white w-8 h-8 rounded-full ${color}`}>
        <DoneIcon />
      </div>
    );
  };

  const getStepIconComponent = (condition: any) => {
    const color = condition !== null ? 'bg-[#84BD46]' : 'bg-[#C0C0C0]';
    return <IconComponent color={color} />;
  };

  const getJobList = async () => {
    try {
      const response: any = await handleApiCall({
        method: 'GET',
        url: `jobs/all`,
        token: token,
      });
      if (response.status === 200) {
        setJobData(response.data.jobs);
      }
    } catch (error: any) {
      let msgStr = '';
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        msgStr = errors.join(' ');
      } else {
        msgStr = errors || error?.response?.data?.message;
      }
      showErrorToast(msgStr);
    }
  };

  const getMediaLibrary = async () => {
    try {
      const response: any = await handleApiCall({
        method: 'GET',
        url: `/media-library/all`,
        token: token,
      });

      if (response.status === 200) {
        const mediaDocs = response.data.mediaDocs;
        const images = mediaDocs.filter((item: any) => item.fileType === 'IMAGE');
        if (images.length < 1 && media === 'images') {
          setValue('1');
        }
        setImageLibrary(images);
        const audios = mediaDocs.filter((item: any) => item.fileType === 'AUDIO');
        if (audios.length < 1 && media === 'voice') {
          setValue('1');
        }
        setAudioLibrary(audios);
      }
    } catch (error: any) {
      let msgStr = '';
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        msgStr = errors.join(' ');
      } else {
        msgStr = errors || error?.response?.data?.message;
      }
      showErrorToast(msgStr);
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const response: any = await handleApiCall({
        method: 'DELETE',
        url: `/jobs/${id}/delete`,
        token: token,
      });
      if (response?.status === 200) {
        showSuccessToast(response?.data?.message);
        getJobList();
        handleDeleteModalClose();
      }
    } catch (error: any) {
      let msgStr = '';
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        msgStr = errors.join(' ');
      } else {
        msgStr = errors || error?.response?.data?.message;
      }
      showErrorToast(msgStr);
    }
  };

  const deleteMediaLibrary = async (id: string) => {
    try {
      const response: any = await handleApiCall({
        method: 'DELETE',
        url: `/media-library/delete/${id}`,
        token: token,
      });
      if (response?.status === 200) {
        showSuccessToast(response?.data?.message);
        if (media === 'images') {
          setImage(null);
        } else {
          setAudio(null);
        }
        setSelectedValue('');
        getMediaLibrary();
        handleDeleteModalClose();
      }
    } catch (error: any) {
      let msgStr = '';
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        msgStr = errors.join(' ');
      } else {
        msgStr = errors || error?.response?.data?.message;
      }
      showErrorToast(msgStr);
    }
  };

  const handleFileUpload = async (media: string) => {
    try {
      const formData = new FormData();
      if (media === 'images') {
        formData.append('file', image);
        formData.append('fileType', 'IMAGE');
      } else {
        formData.append('file', audio);
        formData.append('fileType', 'AUDIO');
      }
      const response: any = await handleApiCall({
        method: 'POST',
        url: `media-library/upload`,
        token: token,
        data: formData,
      });
      if (response.status === 200) {
        if (response?.data.data.fileType === 'IMAGE') {
          setUploadImage(response?.data?.data);
        } else {
          setUploadVoice(response?.data?.data);
        }
        handleClose();
      }
    } catch (error: any) {
      let msgStr = '';
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        msgStr = errors.join(' ');
      } else {
        msgStr = errors || error?.response?.data?.message;
      }
      showErrorToast(msgStr);
    }
  };

  const handleFileNameUpdate = async (updatedName: { sourceName: string; newName: string }, id: string) => {
    try {
      const response: any = await handleApiCall({
        method: 'PATCH',
        url: `/media-library/rename/${id}`,
        token: token,
        data: updatedName,
      });
      if (response?.status === 200) {
        await getMediaLibrary();
        if (response?.data.data.fileType === 'IMAGE') {
          setImage({ ...image, url: response?.data.data.url });
        } else {
          setAudio({ ...audio, url: response?.data.data.url });
        }
        showSuccessToast(response?.data?.message);
      }
    } catch (error: any) {
      let msgStr = '';
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        msgStr = errors.join(' ');
      } else {
        msgStr = errors || error?.response?.data?.message;
      }
      showErrorToast(msgStr);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    const imageFileName = getFileNameFromUrl(uploadImage?.url);
    const audioFileName = getFileNameFromUrl(uploadVoice?.url);
    const body = {
      imageName: imageFileName,
      audioName: audioFileName,
      image: uploadImage,
      audio: uploadVoice,
      description: uploadScript,
      user: { id: user._id, name: user.name, email: user.email },
    };
    try {
      const response: any = await handleApiCall({
        method: 'POST',
        url: `/digital-human/make`,
        token: token,
        data: body,
      });
      if (response.status === 201) {
        showSuccessToast('Digital Human Created.');
        getMediaLibrary();
        setUploadImage(null);
        setUploadVoice(null);
        setUploadScript(null);
        setScript(null);
        getJobList();
      }
    } catch (error: any) {
      let msgStr = '';
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        msgStr = errors.join(' ');
      } else {
        msgStr = errors || error?.response?.data?.message;
      }
      showErrorToast(msgStr);
    } finally {
      setValue('1');
      setMedia('images');
    }
  };

  useEffect(() => {
    getJobList();
    getMediaLibrary();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [uploadVoice?.url]);
  return (
    <div className='pt-[25px] '>
      {isApiLoading && <Loader />}
      <div className='flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between pb-[28px]'>
        <div className='grid gap-[6px]'>
          <h3 className='text-[20px] font-[600] text-[#323232]'>Digital Human</h3>
          <p className='text-[10px] font-[400] text-[#808080]'>
            <span>Content Management</span>
            <span> / </span>
            <Link className='text-initial no-underline hover:underline' href={'/dashboard/digital-human'}>
              Digital Human
            </Link>
          </p>
        </div>
        <div>
          <Tooltip title={`${uploadImage ? 'Digital Human creation is in progress' : ''}`} arrow>
            <button
              className={`bg-[#84BD46] text-[#fff] h-[42px] rounded-[4px] inline-flex gap-[10px] py-[8px] px-[16px] items-center justify-center w-full sm:max-w-[140px] ${
                uploadImage && 'cursor-not-allowed'
              }`}
              disabled={uploadImage}
              onClick={() => {
                setAudio(null);
                setImage(null);
                if (imageLibrary.length > 0) {
                  setValue('2');
                } else {
                  setValue('1');
                }
                handleOpen();
              }}
            >
              <span>+</span>
              <span>Create New</span>
            </button>
          </Tooltip>
        </div>
      </div>
      <div className='flex flex-col-reverse lg:flex-row gap-[16px]'>
        <div
          className={`bg-[#fff] border border-[#E6E6E6] rounded-[4px] p-[24px] flex flex-col gap-[24px] h-[70.47vh] overflow-auto ${
            uploadImage ? 'lg:w-[70%]' : 'w-full'
          }`}
        >
          {jobData?.filter((item: any) => item.status === 'completed').length > 0 && (
            <p className='text-[16px] font-[700] mt-6'>Completed</p>
          )}
          {jobData?.filter((item: any) => item.status === 'completed').length > 0 ? (
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
              {jobData
                ?.filter((item: any) => item.status === 'completed')
                .map((item: any, index: any) => {
                  return (
                    <div className='pt-[70px]' key={item}>
                      <Cards item={item} setDeleteId={setDeleteId} handleDeleteModalOpen={handleDeleteModalOpen} />
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className='text-center'>No Digital Human Found.</div>
          )}
        </div>
        {uploadImage && (
          <div className='flex flex-col border border-[#E6E6E6] bg-[#fff] rounded-[4px] py-[16px] pl-[19px] pr-[24px] lg:w-[30%] lg:h-[70.47vh] overflow-auto'>
            <div className='flex flex-row justify-between items-center'>
              <h2 className='text-[14px] font-[700]'>Create Digital Human</h2>
            </div>
            <div>
              <Stepper orientation='vertical' nonLinear sx={stepperStyled}>
                <Step>
                  <StepLabel StepIconComponent={() => getStepIconComponent(uploadImage)} />
                  <StepContent>
                    <div className='ml-[10px] mt-[-36px]'>
                      <Image src={uploadImage?.url} width={246} height={246} alt='human-image' />
                      <button
                        className=' mt-[7.75px] flex gap-1 items-center text-[#808080] text-[12px] hover:underline'
                        onClick={() => {
                          if (imageLibrary.length > 0) {
                            setValue('2');
                          } else {
                            setValue('1');
                          }
                          setIsAudioUploaded(false);
                          setSelectedValue('');
                          setMedia('images');
                          setOpen(true);
                          setImage(null);
                        }}
                      >
                        <Image src={'/Images/Digital-Human/refresh.svg'} width={12} height={12} alt='change image' />
                        Change Image
                      </button>
                    </div>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel StepIconComponent={() => getStepIconComponent(uploadVoice)}>
                    {uploadVoice === null ? (
                      <button
                        className='bg-[#F6F6F6] rounded-[4px] p-[8px] flex gap-[23px] cursor-pointer'
                        onClick={() => {
                          if (audioLibrary.length > 0) {
                            setValue('2');
                          } else {
                            setValue('1');
                          }
                          setMedia('voice');
                          setOpen(true);
                        }}
                      >
                        <div className='flex gap-[10px] items-center w-full'>
                          <div className='bg-[#84BD46] p-[9px] flex justify-center rounded-[4px]'>
                            <Image src={'/Images/microphone.svg'} width={24} height={24} alt='microphone' />
                          </div>
                          <div className='flex flex-col gap-1 w-full'>
                            <h5 className='text-12px] font-[700] text-[#323232]'>Upload Voice</h5>
                            <span className='text-[#808080] text-[10px]'>Max 5 MB</span>
                          </div>
                        </div>
                        <Image
                          src={'/Images/upload.svg'}
                          width={24}
                          height={24}
                          alt='upload-voice'
                          className='animate-shake'
                        />
                      </button>
                    ) : (
                      <>
                        <audio ref={audioRef} controls className='w-full' controlsList='nodownload noplaybackrate'>
                          <source src={uploadVoice?.url} type='audio/mpeg' />
                          <track kind='captions' src='' label='No captions available' default />
                          Your browser does not support the audio tag.
                        </audio>
                        <button
                          className='mt-[7.75px] flex gap-1 items-center text-[#808080] text-[12px] hover:underline'
                          onClick={() => {
                            if (audioLibrary.length > 0) {
                              setValue('2');
                            } else {
                              setValue('1');
                            }
                            setIsAudioUploaded(false);
                            setSelectedValue('');
                            setMedia('voice');
                            setOpen(true);
                            setAudio(null);
                          }}
                        >
                          <Image src={'/Images/Digital-Human/refresh.svg'} width={12} height={12} alt='change image' />
                          Change Audio
                        </button>
                      </>
                    )}
                  </StepLabel>
                </Step>
                {uploadVoice && (
                  <Step>
                    <StepLabel StepIconComponent={() => getStepIconComponent(uploadScript)}>
                      {uploadScript === null ? (
                        <button
                          className='bg-[#F6F6F6] rounded-[4px] p-[8px] flex gap-[23px] cursor-pointer'
                          onClick={() => {
                            setMedia('text');
                            setValue('3');
                            setOpen(true);
                          }}
                        >
                          <div className='flex gap-[10px] items-center w-full'>
                            <div className='bg-[#84BD46] p-[9px] flex justify-center rounded-[4px]'>
                              <Image
                                src={'/Images/Digital-Human/text-icon.svg'}
                                width={24}
                                height={24}
                                alt='microphone'
                              />
                            </div>
                            <h5 className='text-12px] font-[600] text-[#323232]'>Write Script</h5>
                          </div>
                          <Image
                            src={'/Images/upload.svg'}
                            width={24}
                            height={24}
                            alt='upload-script'
                            className='animate-shake'
                          />
                        </button>
                      ) : (
                        <>
                          <div className='flex gap-[10px] items-center py-2 px-4 rounded-lg bg-[#F6F6F6]'>
                            <div className='bg-white p-[6px] flex justify-center rounded-[4px]'>
                              <Image
                                src={'/Images/Digital-Human/text-file-icon.svg'}
                                width={40}
                                height={38.45}
                                alt='text-file'
                              />
                            </div>
                            <div className='flex flex-col gap-1 w-full'>
                              <h5 className='text-12px] font-[700] text-[#323232]'>
                                {uploadScript.length < 25 ? uploadScript : uploadScript.slice(0, 25) + '...  '}
                              </h5>
                              <span className='text-[#808080] text-[10px]'>
                                {uploadScript.length === 1
                                  ? `${uploadScript.length} Character`
                                  : `${uploadScript.length} Characters`}
                              </span>
                            </div>
                          </div>
                          <button
                            className='mt-[7.75px] flex gap-1 items-center text-[#808080] text-[12px] hover:underline'
                            onClick={() => {
                              setValue('3');
                              handleOpen();
                              setMedia('text');
                            }}
                          >
                            <Image
                              src={'/Images/Digital-Human/refresh.svg'}
                              width={12}
                              height={12}
                              alt='change image'
                            />
                            Change Script
                          </button>
                        </>
                      )}
                    </StepLabel>
                  </Step>
                )}
              </Stepper>
            </div>
            {uploadImage && uploadVoice && uploadScript && (
              <div className='mt-6 flex flex-col gap-6 flex-1 justify-end'>
                <div className='relative w-full'>
                  <button
                    className='relative w-full py-3 text-center rounded bg-[#84BD46] text-white'
                    onClick={handleSubmit}
                  >
                    Create Digital Human
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <BasicModal
        open={open}
        handleClose={handleClose}
        media={media}
        uploadScript={uploadScript}
        setUploadImage={setUploadImage}
        setUploadVoice={setUploadVoice}
        setUploadScript={setUploadScript}
        image={image}
        setImage={setImage}
        audio={audio}
        setAudio={setAudio}
        value={value}
        setValue={setValue}
        script={script}
        setScript={setScript}
        imageLibrary={imageLibrary}
        audioLibrary={audioLibrary}
        handleFileUpload={handleFileUpload}
        deleteMediaLibrary={deleteMediaLibrary}
        handleFileNameUpdate={handleFileNameUpdate}
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
        isImageUploaded={isImageUploaded}
        setIsImageUploaded={setIsImageUploaded}
        isAudioUploaded={isAudioUploaded}
        setIsAudioUploaded={setIsAudioUploaded}
        isScriptUploaded={isScriptUploaded}
        setIsScriptUploaded={setIsScriptUploaded}
      />
      <DeleteModal
        openDeleteModal={openDeleteModal}
        handleDeleteModalClose={handleDeleteModalClose}
        text='Are you sure you want to delete this Digital Human?'
        deleteId={deleteId}
        handleDelete={deleteCard}
      />
    </div>
  );
};

export default DigitalHuman;
