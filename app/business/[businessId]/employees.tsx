import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import {
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router/build/hooks";
import { Card, User } from "@/db/schema";
import { GetBusinessEmployeesResponse } from "@/app/api/business/getBusinessEmployees+api";

// export default function TabTwoScreen() {
//   return "hiii";
// }

export default function Employees() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const { businessId } = useGlobalSearchParams<{ businessId: string }>();
  const [businessEmployees, setBusinessEmployees] = useState<
    GetBusinessEmployeesResponse | undefined
  >(undefined);

  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);

        const response = await fetch("/api/business/getBusinessEmployees", {
          method: "POST",
          body: JSON.stringify({ businessId }),
        });
        const json = await response.json();
        const businessEmployees = json.data as GetBusinessEmployeesResponse;
        setBusinessEmployees(businessEmployees);
        console.log({ businessEmployees });
      } catch (e) {
        console.log(e);
        setError("Something went wrong: " + (e as Error).message);
      }
    }
    start();
  }, []);

  if (isLoadingUser)
    return (
      <ThemedView>
        <ThemedText>"loading user..."</ThemedText>
      </ThemedView>
    );

  if (!user) return <Redirect href="/(tabs)" />;

  return (
    <ThemedView style={{ padding: 10 }}>
      {businessEmployees == undefined ? (
        <ThemedText>loading...</ThemedText>
      ) : businessEmployees.length == 0 ? (
        <ThemedText>no employees found</ThemedText>
      ) : (
        businessEmployees.map((employee, i) => (
          <ThemedView key={i}>
            <ThemedText>Employee Name: {employee.employeeName}</ThemedText>
            <ThemedText>Email: {employee.employeeEmail}</ThemedText>
            <ThemedText>
              Can Give Points: {employee.canGivePoints ? "Yes" : "No"}
            </ThemedText>
            <ThemedText>Image: {employee.employeeImage}</ThemedText>
          </ThemedView>
        ))
      )}
      {error && <ThemedText>{error}</ThemedText>}
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
