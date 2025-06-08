
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, SkeletonText, Avatar, Box, Grid, Button, Heading, Stack, StackDivider, Text, UnorderedList, ListItem,
  useDisclosure, Table, Tbody, Td, Th, Thead, Tr,
  useColorModeValue,
  Input,
  Flex,
  Progress,
  FormControl,
  FormLabel,
  Switch,
  Textarea,IconButton,
  Select,useToast,Divider
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { collection, doc, getDoc, getDocs, query, updateDoc, where, deleteField } from 'firebase/firestore';
import { db } from '/Users/omkardarekar/Documents/Be Project/credbud-web-frontend-final/src/firebase.js';
// Custom components
import Banner from "views/admin/profile/components/Banner";
// Assets
import banner from "assets/img/auth/banner.png";
import React, { useEffect, useState } from "react";
import { useUserAuth } from "contexts/UserAuthContext";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { searchUser } from "api/apiService";
import Card from "components/card/Card";
import { getUserAttendance } from "api/apiService";
import { updateRemarks } from "api/apiService";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { getSubjectStats } from "api/apiService";
import { fetchYears, fetchDepartments, fetchSemesters, fetchSubjects, allocateSubject, revokeSubject, fetchAllocatedSubjects } from 'api/apiService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { editStaffProfile } from "api/apiService";
export default function Overview() {
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

  const [modalProp, setModalProp] = useState({})
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [data, setData] = useState([])
  const { searchedProfile } = useUserAuth()
  const [viewModal, setViewModal] = useState(false)
  const [attendanceData, setAttendanceData] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(false);

  const { id, userType } = useParams();
  let mainText = useColorModeValue('navy.700', 'white');
  let secondaryText = useColorModeValue('gray.700', 'white');
  // console.log(searchedProfile)

  const [remarks, setRemarks] = useState(null)

  const handleRemarks = async () => {
    setIsUploading(true)
    let remarkData = {
      "message": remarks,
      "id": data.id
    }
    if (!data.grantProfileExtras[data.currentSem].remarks) {
      data.grantProfileExtras[data.currentSem].remarks = {};
    }
    data.grantProfileExtras[data.currentSem].remarks.message = remarks;
    data.grantProfileExtras[data.currentSem]["remarks"]["message"] = remarks
    const call = await updateRemarks(remarkData)
    if (call.message) {

    }
    setIsUploading(false)
  }
  useEffect(() => {
    async function fetchData() {
      try {
        if (!searchedProfile) {
          const userData = await searchUser(id, "id", userType);
          setData(userData[0].data);
        } else {
          setData(searchedProfile.data);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsLoaded(true);
      }
    }

    fetchData();
    console.log(data.data)
  }, [id, userType, searchedProfile]);
  const [quickViewEnabled, setQuickViewEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false)
  const [statistics, setStatistics] = useState({})
  const toggleQuickView = () => {
    setQuickViewEnabled(!quickViewEnabled);
  };
  function getSemesterAbbreviation(currentSemester) {
    let abbreviation;
    switch ((currentSemester)) {
      case 1:
        abbreviation = "FE"; // First Year Engineering
        break;
      case 2:
        abbreviation = "FE"; // First Year Engineering
        break;
      case 3:
        abbreviation = "SE"; // Second Year Engineering
        break;
      case 4:
        abbreviation = "SE"; // Second Year Engineering
        break;
      case 5:
        abbreviation = "TE"; // Third Year Engineering
        break;
      case 6:
        abbreviation = "TE"; // Third Year Engineering
        break;
      case 7:
        abbreviation = "BE"; // Third Year Engineering
        break;
      case 8:
        abbreviation = "BE"; // Third Year Engineering
        break;
      default:
        abbreviation = "NA"; // Bachelor of Engineering
    }
    return (abbreviation);
  }
  if (!isLoaded || !data) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
      </Box>
    );
  }


  const handleProfileModal = async () => {
    setModalProp({
      func: 1,
      heading: "Edit Profile", // Update heading directly in setModalProp
    });
    onOpen()

  }
  const handleSubjectModal = async () => {
    setModalProp({
      func: 3,
      heading: "Subject Management", // Update heading directly in setModalProp
    });
    onOpen()

  }
  const handleStatistics = async (subject, division, semester, year) => {
    onOpen()
    setIsUploading(true)
    setModalProp({
      func: 2,
      heading: subject + " Statistics", // Update heading directly in setModalProp
    });
    const subData = {
      "subject": subject, "division": division, "semester": semester, "subjectYear": year
    }
    let statisticsd = await getSubjectStats(subData)
    setStatistics(statisticsd)
    setIsUploading(false)


  }
  const deleteSubject = async (subjectToDelete) => {
    const teacherId = data.id;
  if (!teacherId) {
    console.error("No teacher ID provided");
    return;
  }

  if (!subjectToDelete) {
    console.error("No subject provided for deletion");
    return;
  }

  setLoading(true);
  try {
    const teacherRef = doc(db, `Sinhgad/users/moderators/${teacherId}`);
    
    // Use FieldValue.delete() to remove the specific subject
    await updateDoc(teacherRef, {
      [`subjectsAllocated.${subjectToDelete}`]: deleteField()
    });

    // Show success message or update state as needed
    console.log(`Successfully deleted subject: ${subjectToDelete}`);
    alert(`${subjectToDelete} deleted successfully!`);
    window.location.reload();
  } catch (error) {
    console.error("Error deleting subject:", error);
  } finally {
    setLoading(false);
  }
};
  const Statistics = () => {
    const data = statistics.data
    const pieData = {
      labels: ['UT Appeared', 'UT Failed', 'UT Reappeared', 'Prelim Appeared', 'Prelim Failed', 'Prelim Reappeared'],
      datasets: [
        {
          label: 'UT/Prelim Stats',
          data: [
            data.totalUTAppeared,
            data.totalUTFailed,
            data.totalUTReappeared,
            data.totalPrelimAppeared,
            data.totalPrelimFailed,
            data.totalPrelimReappeared,
          ],
          backgroundColor: ['#E38627', '#C13C37', '#6A2135', '#8B3A3A', '#F88E8E', '#A64242'],
        },
      ],
    };

    const barData = {
      labels: data.assignmentsCompletedCount ? Object.keys(data.assignmentsCompletedCount) : [],
      datasets: [
        {
          label: 'Assignments Completed',
          data: data.assignmentsCompletedCount ? Object.values(data.assignmentsCompletedCount) : [],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    const barOptions = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Assignments',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Student Count',
          },
          beginAtZero: true,
        },
      },
      maintainAspectRatio: false, // Ensure the chart scales correctly
    };

    return (
      <Box>
        <Text fontWeight="bold" mb="2">Summary:</Text>
        <Table variant="simple" mb="4">
          <Thead>
            <Tr>
              <Th>Category</Th>
              <Th>Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Total Students</Td>
              <Td>{data.totalStudents}</Td>
            </Tr>
            <Tr>
              <Td>Total Assignments</Td>
              <Td>{data.totalAssignmentsTotal}</Td>
            </Tr>
          </Tbody>
        </Table>

        <Text fontWeight="bold" mb="2">Assignments Completed:</Text>
        <Table variant="simple" mb="4">
          <Thead>
            <Tr>
              <Th>Assignments Completed</Th>
              <Th>Student Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.assignmentsCompletedCount ? Object.entries(data.assignmentsCompletedCount).map(([assignments, count]) => (
              <Tr key={assignments}>
                <Td>{assignments}</Td>
                <Td>{count}</Td>
              </Tr>
            )) : (
              <Tr>
                <Td colSpan="2">No data available</Td>
              </Tr>
            )}
          </Tbody>
        </Table>




        

        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1.34fr 4fr" }}
            templateRows={{ base: "repeat(3, 1fr)", lg: "1fr" }}
            gap={{ base: "20px", xl: "20px" }}>
            <Card>
            <Text fontWeight="bold" mb="2">Assignments Stats</Text>
              <Box width="300px" height="300px"> {/* Adjust width and height here */}
                <Bar data={barData} options={barOptions} />
              </Box>
            </Card>
            <Card>

            <Box width="300px" height="300px"> 
        <Text fontWeight="bold" mb="2">UT/Prelim Stats</Text>
            {/* Adjust width and height here */}
              <Pie data={pieData} />
            </Box>
            </Card>

          </Grid>
        </Box>
      </Box>
    );
  };
  const EditStaffProfile = () => {
    const [profile, setProfile] = useState(data);
  
    const handleChange = (field, value) => {
      setProfile({
        ...profile,
        [field]: value,
      });
    };
  
    const handleTempAdminChange = (field, value) => {
      setProfile({
        ...profile,
        tempAdmin: {
          ...profile.tempAdmin,
          [field]: value,
        },
      });
    };
  
    const handleSubmit = async() => {
      setIsUploading(true)
      const updatedProfile = {
        id: profile.id,
        updatedProfile: profile,
      };
      // Send updatedProfile to your API endpoint here
      await editStaffProfile(updatedProfile)
      // This will reload the current page
window.location.reload();

      setIsUploading(false)
    };
  
    return (
      <Box>
        <FormControl id="name" mb="4">
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            value={profile.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </FormControl>
  
        <FormControl id="contact" mb="4">
          <FormLabel>Contact</FormLabel>
          <Input
            type="tel"
            value={profile.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
          />
        </FormControl>
  
        <FormControl id="email" mb="4">
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={profile.email}
            disabled
          />
        </FormControl>
  
        <FormControl id="designation" mb="4">
          <FormLabel>Designation</FormLabel>
          <Input
            type="text"
            value={profile.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
        </FormControl>
  
        <FormControl id="department" mb="4">
          <FormLabel>Department</FormLabel>
          <Input
            type="text"
            value={profile.department}
            disabled
          />
        </FormControl>
  
        <FormControl display="flex" alignItems="center" mb="4">
          <FormLabel htmlFor="isTeaching">Is Teaching</FormLabel>
          <Switch
            id="isTeaching"
            isChecked={profile.isTeaching}
            onChange={(e) => handleChange('isTeaching', e.target.checked)}
          />
        </FormControl>
  
        <FormControl display="flex" alignItems="center" mb="4">
          <FormLabel htmlFor="isAdmin">Is Admin</FormLabel>
          <Switch
            id="isAdmin"
            isChecked={profile.tempAdmin.isAdmin}
            onChange={(e) => handleTempAdminChange('isAdmin', e.target.checked)}
          />
        </FormControl>
  
        <FormControl id="expiresOn" mb="4">
          <FormLabel>Admin Expires On</FormLabel>
          <Input
            type="date"
            value={profile.tempAdmin.expiresOn || ''}
            onChange={(e) => handleTempAdminChange('expiresOn', e.target.value)}
          />
        </FormControl>
  
        <FormControl id="customRights" mb="4">
          <FormLabel>Custom Rights</FormLabel>
          <Textarea
            value={profile.tempAdmin.customRights || ''}
            onChange={(e) => handleTempAdminChange('customRights', e.target.value)}
          />
        </FormControl>
  
        <Button colorScheme="teal" onClick={handleSubmit}>Save</Button>
      </Box>
    );
  };
  
const SubjectAllocationForm = ({  }) => {
  const teacherId = data.id ;
  const [semesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [divisions] = useState(['A', 'B']);
  const [subjectYears, setSubjectYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSubjectYear, setSelectedSubjectYear] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const fetchSubjectYears = async () => {
    try {
      const studentsRef = collection(db, 'Sinhgad/users/students');
      const querySnapshot = await getDocs(studentsRef);
      const yearSet = new Set();
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.admissionYear) {
          yearSet.add(data.admissionYear);
        }
      });
      return Array.from(yearSet);
    } catch (error) {
      console.error("Error fetching subject years:", error);
      return [];
    }
  };

  const fetchDepartments = async (year) => {
    try {
      const moderatorsRef = collection(db, 'Sinhgad/users/moderators');
      const querySnapshot = await getDocs(moderatorsRef);
      const deptSet = new Set();
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.department) {
          deptSet.add(data.department);
        }
      });
      return Array.from(deptSet);
    } catch (error) {
      console.error("Error fetching departments:", error);
      return [];
    }
  };

  const fetchSubjects = async (year, department, semester) => {
    try {
      const subjectsRef = collection(db, `Sinhgad/attendance/${year}/${department}/subjects`);
      const q = query(subjectsRef, where('semester', '==', parseInt(semester)));
      const querySnapshot = await getDocs(q);
      const subjectInitialSet = new Set();
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.subjectInitial) {
          subjectInitialSet.add(data.subjectInitial);
        }
      });
      return Array.from(subjectInitialSet);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  };

  const allocateSubject = async () => {
    if (!teacherId) {
      console.error("No teacher ID provided");
      return;
    }

    if (!selectedSubject || !selectedDivision || !selectedSemester || !selectedSubjectYear || !selectedDepartment) {
      console.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const teacherRef = doc(db, `Sinhgad/users/moderators/${teacherId}`);
      const subjectData = {
        division: selectedDivision,
        semester: parseInt(selectedSemester),
        subjectYear: selectedSubjectYear,
        department: selectedDepartment
      };
      
      await updateDoc(teacherRef, {
        [`subjectsAllocated.${selectedSubject}`]: subjectData
      });

      // Reset form fields
      setSelectedSubject('');
      setSelectedDivision('');
      setSelectedSemester('');
      setSelectedSubjectYear('');
      setSelectedDepartment('');
       alert(`${selectedSubject} Allocated successfully!`);
      window.location.reload();
    } catch (error) {
      console.error("Error allocating subject:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const years = await fetchSubjectYears();
        setSubjectYears(years);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [teacherId]);

  useEffect(() => {
    if (selectedSubjectYear) {
      fetchDepartments(selectedSubjectYear).then(setDepartments);
    }
  }, [selectedSubjectYear]);

  useEffect(() => {
    if (selectedSubjectYear && selectedDepartment && selectedSemester) {
      fetchSubjects(selectedSubjectYear, selectedDepartment, selectedSemester).then(setSubjects);
    }
  }, [selectedSubjectYear, selectedDepartment, selectedSemester]);

  if (!teacherId) {
    return (
      <Box p={6} borderRadius="2xl" boxShadow="lg" bg="white">
        <Text color="red.500">Error: Teacher ID is required to load this form.</Text>
      </Box>
    );
  }

  return (
    <Box p={6} borderRadius="2xl" boxShadow="lg" bg="white">
      <Heading size="md" mb={4}>Subject Allocation</Heading>
      <form onSubmit={(e) => { e.preventDefault(); allocateSubject(); }}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Subject Year</FormLabel>
            <Select 
              placeholder="Select Year" 
              value={selectedSubjectYear} 
              onChange={(e) => setSelectedSubjectYear(e.target.value)}
              isDisabled={loading}
            >
              {subjectYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired isDisabled={!selectedSubjectYear || loading}>
            <FormLabel>Department</FormLabel>
            <Select 
              placeholder="Select Department" 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Semester</FormLabel>
            <Select 
              placeholder="Select Semester" 
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)}
              isDisabled={loading}
            >
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Division</FormLabel>
            <Select 
              placeholder="Select Division" 
              value={selectedDivision} 
              onChange={(e) => setSelectedDivision(e.target.value)}
              isDisabled={loading}
            >
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired isDisabled={!selectedDepartment || !selectedSemester || loading}>
            <FormLabel>Subject</FormLabel>
            <Select 
              placeholder="Select Subject" 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </Select>
          </FormControl>

          <Button 
            type="submit" 
            colorScheme="blue" 
            isLoading={loading}
            loadingText="Allocating..."
          >
            Allocate
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
  return (
    <>
      <Modal onClose={onClose} size="full" isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>

          <ModalHeader>{data.name} {modalProp.Heading}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap="20px">

            </Flex>
            {isUploading && (
              <Box w="100%" position="absolute" top="0" left="0" zIndex="1">
                <Progress w="100%" h="5px" isIndeterminate />
              </Box>)}
            {modalProp.func == 2 && !isUploading && <><Statistics /></>}
            {modalProp.func == 1 && !isUploading && <><EditStaffProfile /></>}
            {modalProp.func == 3 && !isUploading && <><SubjectAllocationForm /></>}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal >

      <Box  pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Grid
          templateColumns={{ base: "1fr", lg: "1.34fr 4fr" }}
          templateRows={{ base: "repeat(3, 1fr)", lg: "1fr" }}
          gap={{ base: "20px", xl: "20px" }}>
          {!isLoaded ? (
            <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={4} spacing='4' skeletonHeight='2' />} />
          ) : (
            <Banner
              gridArea='1 / 1 / 2 / 2'
              banner={banner}
              avatar={data.name}
              name={data.name}
              post={data.designation}
              dept={`Department of ${data.department}`}
            />
          )}
          <Card>
            <Heading size="md" mb="4">ID: {data.id}</Heading>
            <Stack spacing="4">
              <Text fontWeight="bold">{data.tempAdmin.isAdmin ? `Temporary Administrator till (${data.tempAdmin.expiresOn})` : "Moderator"}</Text>
              <Text fontWeight="bold">{data.isTeaching ? "Teaching" : "Available for teaching"}</Text>
              <Text fontWeight="bold">Contact: {data.contact}</Text>
              <Text fontWeight="bold">Email:{data.email}</Text>
          <Box>
                <Button mt="2" mr="2" colorScheme="blue" onClick={handleProfileModal}>Edit</Button>
                <Button mt="2" colorScheme="blue" onClick={handleSubjectModal}>Subject Allocation</Button>
              </Box>
              
            </Stack>
          
          </Card>
          

        </Grid>

        <Grid
  templateColumns={{ base: "1fr", lg: "1.34fr 2fr" }}
  gap={6}
  mt={6}>
  <Card>
    <Heading size="md">Subjects Allocated</Heading>
    <Stack divider={<StackDivider />} spacing="4">
      <Box mt="4">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th><b>Subject</b></Th>
              <Th><b>Division</b></Th>
              <Th><b>Semester</b></Th>
              <Th><b>Statistics</b></Th>
              <Th><b>Action</b></Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.keys(data.subjectsAllocated).map((subject, index) => (
              <Tr key={index}>
                <Td><b>{subject}</b></Td>
                <Td><b>{data.subjectsAllocated[subject].division}</b></Td>
                <Td><b>{getSemesterAbbreviation(data.subjectsAllocated[subject].semester)}</b></Td>
                <Td>
                  <IconButton
                    icon={<ExternalLinkIcon />}
                    variant="ghost"
                    onClick={() => handleStatistics(subject, data.subjectsAllocated[subject].division, data.subjectsAllocated[subject].semester, data.subjectsAllocated[subject].subjectYear)}
                    aria-label="View statistics"
                  />
                </Td>
                <Td>
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => deleteSubject(subject)}
                    aria-label="Delete subject"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Stack>
  </Card>
</Grid>
      </Box>
    </>

  );
}