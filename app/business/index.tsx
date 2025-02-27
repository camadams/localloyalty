import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, Redirect, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { getUser } from "@/db/dummyData";
import { User } from "@/db/schema";
import { BusinessWithEmployees } from "../api/business+api";
import { Entypo } from "@expo/vector-icons";
// export default function TabTwoScreen() {
//   return "hiii";
// }

export default function TabTwoScreen() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  const [businessesWithEmployees, setBusinessesWithEmployees] = useState<
    BusinessWithEmployees[] | undefined
  >(undefined);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState<boolean>(true);

  const [error, setError] = useState<string | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      async function start() {
        try {
          const user = await getUser();
          setUser(user);
          setIsLoadingUser(false);

          const response = await fetch("/api/business", {
            method: "POST",
            body: JSON.stringify({ userId: user?.id! }),
          });
          const ownedBusinessesAndEmployees = (await response.json())
            .ownedBusinessesAndEmployees as BusinessWithEmployees[];
          setBusinessesWithEmployees(ownedBusinessesAndEmployees);
        } catch (e) {
          console.log(e);
        }
      }
      start();
    }, [])
  );

  if (isLoadingUser)
    return (
      <ThemedView>
        <ThemedText>"loading user..."</ThemedText>
      </ThemedView>
    );

  if (!user) return <Redirect href="/" />;

  return (
    <ThemedView style={{ padding: 10, gap: 10 }}>
      <ThemedView style={{ alignItems: "flex-end" }}>
        <ThemedText>
          <Link
            href="/business/new"
            push
            style={{
              backgroundColor: "slategray",
              paddingHorizontal: 8,
              borderRadius: 10,
            }}
          >
            <ThemedText style={{ fontSize: 12 }}>
              <Entypo name="plus" size={10} color="white" /> Add Business
            </ThemedText>
          </Link>
        </ThemedText>
      </ThemedView>
      {businessesWithEmployees == undefined ? (
        <ThemedText>Loading business...</ThemedText>
      ) : businessesWithEmployees == null ||
        businessesWithEmployees.length === 0 ? (
        <ThemedText>No business</ThemedText>
      ) : (
        <ThemedView style={{ gap: 10 }}>
          {businessesWithEmployees.map((business, i) => (
            <Link
              key={i}
              href={{
                pathname: "/business/[businessId]/details",
                params: { businessId: business.businessId },
              }}
            >
              <ThemedText>{business.businessName}</ThemedText>
              {/* <ThemedView
                style={{
                  backgroundColor: "slategray",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <ThemedView
                  style={{
                    backgroundColor: "slategray",
                    flexDirection: "row",
                    gap: 5,
                  }}
                >
                  <ThemedText>{business.businessName} </ThemedText>
                  <Link
                    href={{
                      pathname: "/business/[id]",
                      params: { id: business.businessId },
                    }}
                  >
                    <Ionicons name="qr-code-outline" size={24} color="black" />{" "}
                    <ThemedText
                      style={{ textDecorationLine: "underline", fontSize: 12 }}
                    >
                      View QR Code
                    </ThemedText>
                  </Link>
                </ThemedView>
                <ThemedView
                  style={{ gap: 5, backgroundColor: "gray", padding: 10 }}
                >
                  {business.employees.map((employee, j) => (
                    <ThemedText key={j}>
                      {`${employee.userName} (${employee.userEmail})`}
                    </ThemedText>
                  ))}
                  <ThemedText>
                    <Link
                      href="/"
                      style={{
                        backgroundColor: "steelblue",
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        //   flexDirection: "row",
                      }}
                    >
                      <ThemedText>
                        <Entypo name="plus" size={16} color="white" /> Add
                        employee
                      </ThemedText>
                    </Link>
                  </ThemedText>
                </ThemedView>
              </ThemedView> */}
            </Link>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // cardContainer: {
  //   maxWidth: 400,
  // },
  titleContainer: {
    flexDirection: "column",
    gap: 16,
    padding: 32,
  },
});
