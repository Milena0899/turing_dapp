import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from "../contracts/Token.json";
import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
// import { Transfer } from "./Transfer";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";
import { Voting } from "./Voting";
// import { Tabela } from "./Tabela";

// This is the default id used by the Hardhat Network
const HARDHAT_NETWORK_ID = '31337';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance_token: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      authorized: true,
      usersWithBalances: [],
      users: [],
      votingActive: true,
      eError: undefined,
      codinome: undefined,
    };

    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install a wallet.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (!this.state.tokenData || !this.state.balance_token) {
      return <Loading />;
    }


    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              {this.state.tokenData.name} ({this.state.tokenData.symbol})
            </h1>
            <p>
              {ethers.utils.formatEther(this.state.balance)} turings
            </p>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
            {/* 
              Sending a transaction isn't an immediate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
            {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}

            {this.state.eError && (
              <div className="alert alert-danger" role="alert">
                {this.state.eError}
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="row-md-6">
            <div className="row">
              <div className="col-md-6 border">
                {ethers.BigNumber.from(this.state.balance).eq(0) && (
                  this.state.authorized ? (
                    <NoTokensMessage selectedAddress={this.state.selectedAddress} />
                  ) : (
                    <NoTokensMessage selectedAddress={this.state.selectedAddress} />
                  )
                )}

                {ethers.BigNumber.from(this.state.balance) && (
                  <Voting
                    vote={(codinome, amount) => this._vote(codinome, amount)}
                    issueTokens={(codinome, amount) => this._issueTokens(codinome, amount)}
                    authorized={this.state.authorized}
                    balance={ethers.BigNumber.from(this.state.balance)}
                    users={this.state.users}
                    />
                )}
              </div>

              <div className="col-md-6 text-center border">
                <p>
                  Estado da votação:
                  <span>
                    {this.state.votingActive === true ? " Ativa" : " Desativada"}
                  </span>
                </p>
                {this.state.authorized && (
                  <div>
                    {this.state.votingActive === true ? (
                      <button
                        className="btn border"
                        style={{ fontWeight: 'bold', border: '3px solidrgb(0, 224, 244)', margin: '10px' }}
                        onClick={async () => {
                          const tx = await this._token.votingOff();
                          await tx.wait();
                          this._votingStatus();
                        }}>
                        Desativar Votação
                      </button>
                    ) : (
                      <button
                        className="btn border"
                        style={{ fontWeight: 'bold', border: '3px solidrgb(17, 0, 91)', margin: '10px' }}
                        onClick={async () => {
                          // const tx = await this._token.votingOn();
                          // await tx.wait();
                          this._votingStatus();
                        }}
                      >
                        Ativar Votação
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
                {/* tabela */}
          <div className="row-md-6">  
              <div className="card mt-4">
                <div className="card-header">
                  <h5 className="text-center">Classificação</h5>
                </div>
                <div className="card-body p-0">
                  <table className="table  table-bordered">
                    <thead className="table-warning">
                      <tr>
                        <th className="text-center">Aluno</th>
                        <th className="text-center">Turings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.usersWithBalances.map((user, index) => (
                        <tr key={index}>
                          <td className="text-center">{user.codinome}</td>
                          <td className="text-center">{user.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>           
          </div>

        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async componentDidMount() {
    this._initializeEthers();

    this._token.on('RegisteredVote', (voter, amount) => {
      this._updateBalance();
    });

    this._token.on('TokenGenerated', (admin, recipient, amount) => {
      this._updateBalance(); 
    });
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (!selectedAddress) {
      console.error("Endereço da carteira não encontrado");
      return;
    }

    // Once we have the address, we can initialize the application.

    // First we check the network
    this._checkNetwork();

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp
    
    // We first store the user's address in the component's state

    //Check if the address is not null
    if (userAddress && ethers.utils.isAddress(userAddress)) {
      this.setState({
        selectedAddress: userAddress,
      });
  
      // Then, we initialize ethers, fetch the token's data, and start polling
      // for the user's balance.

      // Fetching the token data and the user's balance are specific to this
      // sample project, but you can reuse the same initialization pattern.
      this._initializeEthers();
      this._getTokenData();
      this._startPollingData();
      this._admin(userAddress);
      this._getCodinomeUser(userAddress);
      this._getBalances();
      this._votingStatus();
    } else {
      console.error("Invalid Address!!");
    }
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // Then, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);
    
    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _admin(userAddress) {
    const authorized = await this._token.isAdmin(userAddress);
    this.setState({ authorized });
  }

  async _getCodinomeUser(userAddress) {
    try {
      const codinome = await this._token.getUser(userAddress);
      this.setState({ codinome });
    } catch (error) {
      this.setState({ codinome: userAddress });
    }
  }

  async _getBalances() {
    const [codinomes, balances] = await this._token.getBalances();
    
    const usersWithBalances = codinomes
    .map((codinome, index) => ({
      codinome,
      balance: ethers.utils.formatEther(balances[index]),
    }))
    .filter(user => user.balance !== '0.0');
    
    usersWithBalances.sort((a, b) => {
      return parseInt(b.balance) - parseInt(a.balance); 
    });
    this.setState({ usersWithBalances });
    
    if(this.state.authorized){
      const users = codinomes;
      this.setState({ users });
    } else {
      const  users = codinomes
      .filter(codinome => codinome !== this.state.codinome);
      this.setState({ users });
    }
  }

  async _votingStatus() {
    const votingActive = await this._token.votingActive(); 
    this.setState({ votingActive });
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();
    this.setState({ tokenData: { name, symbol } });
  }

  async _updateBalance() {
    const { selectedAddress } = this.state;
  
    if (selectedAddress && ethers.utils.isAddress(selectedAddress)) {
      try {
        const balance       = await this._provider.getBalance(selectedAddress);
        const balance_token = await this._token.balanceOf(selectedAddress);
        this.setState({
          balance: balance.toString(),
          balance_token,
        });

        this._getBalances(); 
      } catch (error) {
        console.error("Erro ao obter o saldo para o endereço:", selectedAddress, error);
      }
    }
  }

  async _issueTokens(codinome, amount) {
    try {
      this._dismissTransactionError();
      this._dismissEError();

      // Verifica se o valor possui mais de 18 dígitos decimais
      const decimalPlaces = (amount.toString().split('.')[1] || '').length;
      if (decimalPlaces > 18) {
        this.setState({ eError: `O valor não pode ter mais de 18 dígitos decimais (Quantidade de digitos atual: ${decimalPlaces}).` });
        return; 
      }

      const value = ethers.utils.parseUnits(amount.toString(), 18);

      const tx = await this._token.issueToken(codinome, value);
      this.setState({ txBeingSent: tx.hash });
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      
      if (error.reason) {
        const match = error.reason.match(/'([^']+)'/);
        this.setState({ eError: match[1] });
      } else {
        console.error(error);
        this.setState({ transactionError: error });
      }
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _vote(codinome, amount) {
    try {
      this._dismissTransactionError();
      this._dismissEError();

      if (!codinome) {
        console.error("Codinome inválido");
        return;
      }
      
      // Verifica se o valor possui mais de 18 dígitos decimais
      const decimalPlaces = (amount.toString().split('.')[1] || '').length;
      if (decimalPlaces > 18) {
        this.setState({ eError: `O valor não pode ter mais de 18 dígitos decimais (Quantidade de digitos atual: ${decimalPlaces}).` });
        return; 
      }

      const value = ethers.utils.parseUnits(amount.toString(), 18);
      const tx = await this._token.vote(codinome, value);
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      if (error.reason) {
        const match = error.reason.match(/'([^']+)'/);
        this.setState({ eError: match[1] });
      } else {
        console.error(error);
        this.setState({ transactionError: error });
      }
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  _dismissEError() {
    this.setState({ eError: undefined });
  }
  
  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  async _switchChain() {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`;
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    await this._initialize(this.state.selectedAddress);
  }

  // This method checks if the selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      this.setState();
    }
  }
}