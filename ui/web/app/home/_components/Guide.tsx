import {useCallback, useState} from "react";
import clsx from "clsx";
import Button from "@/components/Button/Button";
import { useGuideScroll, P, H4, Section, TableOfContents } from '@/components/layout/guide';
import InputText from "../../buy-me-coffee/_components/InputText";
import {BigNumber, ethers} from "ethers";
import InvariantABI from "../../buy-me-coffee/_contracts/InvariantABI";

function GuideSection({
  id,
  title,
  subtext,
  children,
}: {
  id: string;
  title: string;
  subtext: string;
  children: React.ReactNode;
}) {
  return (
    <Section id={id}>
      <H4>{title}</H4>
      <P>{subtext}</P>
      {children}
    </Section>
  );
}

const tocContent = [
  {
    href: '#step-1',
    label: 'Step 1: Add your Invariant',
  },
  {
    href: '#step-2',
    label: 'Step 2: Sleep well knowing that your dapps are safer with the new rules',
  },
];

export default function Guide() {
    useGuideScroll();

    const [address, setAddress] = useState("0x");
    const [condition, setCondition] = useState(1);
    const [action, setAction] = useState(1);
    const [value, setValue] = useState(1);
    const [processing, setProcessing] = useState(false);

    const [fetchedData, setFetchedData] = useState([[],[],[], [BigNumber]]);

    const handleGetData = useCallback(
        async() => {
            setProcessing(true);
            const privateKey = '';
            const providerUrl = 'https://goerli.infura.io/v3/'; // Use your Infura project ID
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
            const provider = new ethers.providers.JsonRpcProvider(providerUrl);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const wallet = new ethers.Wallet(privateKey, provider);
            const contract = new ethers.Contract("0x786Bf8392D2CfA231a34c2559E8d5925AAe4CB67",
                InvariantABI, wallet);

            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const response = await contract.listDataForOwner("0x4690556c739799383f8cE834a230995fD234e6c5");
                // response[3] = response[3].map(Number)

                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument
                setFetchedData(response);
                console.log("tx result", response);
            } catch (error) {
                console.error('Error reading from the contract:', error);
            }
            setProcessing(false);

        },
        [],
    );

    const handleClick = useCallback(
        async() => {
            setProcessing(true);
            const privateKey = '';
            const providerUrl = 'https://goerli.infura.io/v3/'; // Use your Infura project ID
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
            const provider = new ethers.providers.JsonRpcProvider(providerUrl);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const wallet = new ethers.Wallet(privateKey, provider);
            const contract = new ethers.Contract("0x786Bf8392D2CfA231a34c2559E8d5925AAe4CB67",
                InvariantABI, wallet);

            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const response = await contract.storeData(address, condition, action, value);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
                const transactionReceipt = await response.wait();
                if (transactionReceipt.status !== 1) {
                    alert('Txn failed');
                } else{
                    console.log("tx result", transactionReceipt);
                }
            } catch (error) {
                console.error('Error reading from the contract:', error);
            }

            setAddress("0x");
            setCondition(0)
            setAction(0)
            setValue(1)
        },
        [address, condition, action, value],
    );

    function getCondition(conditionGiven: number): string {
        if (conditionGiven === 1 ){
            return "balanceOf"
        } else if (conditionGiven === 2 ){
            return "total supply"
        } else if (conditionGiven === 3 ){
            return "bridge balance"
        } else {
            return "unknown"
        }
    }

    function getAction(actionGiven: number): string {
        if (actionGiven === 1 ){
            return "less than"
        } else if (actionGiven === 2 ){
            return "equal to"
        } else if (actionGiven === 3 ){
            return "greater than"
        } else {
            return "unknown"
        }
    }

    return (
    <>
      <div className="gap-16 lg:flex">
        <main className="w-full flex-shrink-0 flex-grow xl:max-w-[900px]">
          <GuideSection key={1} id="step-1" title="Add your invariant condition" subtext=''>
              <InputText
                  id="address"
                  placeholder="Address"
                  // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                  onChange={(evt) => setAddress(evt.target.value)}
                  disabled={processing}
                  required
              />
              <br/>
              <input
                id="condition"
                type="number"
                placeholder="Condition"
                className={clsx([
                    'block w-full rounded-lg border border-gray-600 bg-boat-color-gray-900',
                    'p-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
                ])}
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                onChange={(evt) => setCondition(parseInt(evt.target.value))}
                disabled={processing}
                required
            />
            <br/>
            <InputText
                id="action"
                placeholder="Action"
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                onChange={(evt) => setAction(parseInt(evt.target.value))}
                disabled={processing}
                required
            />
            <br/>
            <InputText
                id="value"
                placeholder="Value"
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                onChange={(evt) => setValue(parseInt(evt.target.value))}
                disabled={processing}
                required
            />
            <br/>
            <Button
                buttonContent={
                  <>
                    Create New Invariant
                  </>
                }
                onClick={handleClick}
                type="submit"
                disabled={processing}
            />
          </GuideSection>

            <GuideSection key={2} id="step-2" title="List of all your invariants" subtext=''>
                <Button
                    buttonContent={
                        <>
                            Get Invariants
                        </>
                    }
                    onClick={handleGetData}
                    type="button"
                    disabled={false}
                />
                <br/>
                {fetchedData[0].map((each, i) => (

                    <p key={i}>
                        1. {each} / {getCondition(fetchedData[1][i])} / {getAction(fetchedData[2][i])} / {fetchedData[3][i].toString()} ETH
                    </p>

                ))}
            </GuideSection>
        </main>
          <TableOfContents title="Getting Started" contents={tocContent} />
      </div>
    </>
  );
}
