import { Box, Center, Flex, Heading, Text, VStack } from "@chakra-ui/layout";
import {
  Button,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import localforage from "localforage";
import { MdArrowBack, MdCabin } from "react-icons/md";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import { IShipment } from "./shipmentsList";
import { createClient, PostgrestError } from "@supabase/supabase-js";
import { BsPlus } from "react-icons/bs";
import { useEffect } from "react";

export interface ICarriers {
  id: number;
  name: string;
  created_at: string;
  active: boolean;
}

interface ICarriersResponse {
  data: ICarriers[];
  error: PostgrestError | null;
}

async function createEntry(id: string, status: string, carrier: number) {
  let list_carriers: ICarriers[] | null = await localforage.getItem("carriers")
  let parcel : IShipment = {
    id,
    status: status,
    statusId: 255,
    createdAt: new Date(),
    carrier: Number(carrier),
    carrier_name: list_carriers?.find(a => a.id === Number(carrier))?.name,
    updatedAt: new Date(),
    history: [],
  };
  let list: IShipment[] | null = await localforage.getItem("shipmentList");
  let found_obj = list?.find((el) => el.id === id);

  if (found_obj) {
    return found_obj;
  }

  list?.unshift(parcel);
  await localforage.setItem("shipmentList", list || [parcel]);
  return parcel;
}

export async function action({ request, params }: any) {
  const formData = await request.formData();
  const id: string = formData.get("id");
  const carrier: number = formData.get("carrier");
  let error = null;

  await createEntry(id, "", carrier);
  return error ?? redirect(`/shipment/${id}`);
}

function ShipmentAdd() {
  // const { colorMode, toggleColorMode } = useColorMode();
  const { data, error } = useLoaderData() as ICarriersResponse;
  const navigate = useNavigate();
  const actionsData = useActionData() as string;
  const activeCarriers = data?.filter((el) => el.active === true);
  const toast = useToast();
  
  useEffect(() => {
    error && console.error(error);
    error &&
      toast({
        title: "Something went wrong",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
  },[])


  return (
    <Modal isOpen={true} onClose={() => navigate("..")} isCentered={true}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center">
            <Link to="..">
              <IconButton aria-label="Back" icon={<MdArrowBack />} mr="2" />
            </Link>
            <Heading>Add Shipment</Heading>
          </Flex>
        </ModalHeader>
        <ModalBody>
          <Form method="post" action="/shipment/add" style={{ width: "100%" }}>
            <Input placeholder="Tracking ID" type="text" name="id" mb="2" />
            <Select placeholder="Select carrier" mb="4" name="carrier">
              {/* <option value="DPD">DPD</option> */}
              {activeCarriers?.map((row) => (
                <option value={row.id} key={row.id}>
                  {row.name}
                </option>
              ))}
            </Select>
            <Center w="100%" mb="4" flexDirection="column">
              {actionsData && <Text mb="2">{actionsData}</Text>}
              <Button type="submit">
                Add <Icon as={BsPlus} />
              </Button>
            </Center>
          </Form>
        </ModalBody>

        {/* <ModalFooter>
          <Button type="submit">Create</Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
    // <Center w="100vw" h="100vh" pos="absolute" top="0" zIndex="10" bg={colorMode === "light" ? "whiteAlpha.800" : "blackAlpha.800"}  transition="all 0.2s">
    //   <Flex p={5} shadow="md" borderRadius="5px" w={["350px", "450px"]} maxH="500px" bg={colorMode === "light" ? "whiteAlpha.900" : "gray.900"}>
    //     <VStack align="start" w="100%">
    //       <Flex align="center">
    //         <Link to=".."><IconButton aria-label="Back" icon={<MdArrowBack />} mr="2" /></Link>
    //         <Heading as="h3" size="md">
    //           Add Shipment
    //         </Heading>
    //       </Flex>
    //         <Flex direction="column" w="100%">
    //           <Form method="post" action="/shipments/add" style={{width: "100%"}}>
    //             <Input placeholder="Tracking ID" type="text" name="id" mb="2" />
    //             <Select placeholder="Select carrier" mb="2" name="carrier">
    //             {/* <option value="DPD">DPD</option> */}
    //             {data.map(row => <option value={row.id}>{row.name}</option>)}
    //             </Select>
    //             <Center w="100%" mt="2">
    //               <Button type="submit">Create</Button>
    //             </Center>
    //           </Form>
    //         </Flex>
    //     </VStack>
    //   </Flex>
    // </Center>
  );
}

export default ShipmentAdd;
