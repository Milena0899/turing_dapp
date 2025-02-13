//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.20;

// We import this library to be able to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";



// This is the main building block for smart contracts.
contract Token is ERC20 {
    struct User {
        address ad;
        mapping(string => address) voted;
    }

    bool public votingActive;
    
    // An address type variable is used to store ethereum accounts.
    address public owner;
    address teacher = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    string[18] student = [
            'student1',
            'student2',
            'student3',
            'student4',
            'student5',
            'student6',
            'student7',
            'student8',
            'student9',
            'student10',
            'student11',
            'student12',
            'student13',
            'student14',
            'student15',
            'student16',
            'student17',
            'student18'
        ];

    mapping(string => User) public user;

    /**
     * Contract initialization.
     */
    constructor() ERC20("saTurings", "st") {

        owner = msg.sender;

        address[18] memory addresses = [
            0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
            0x90F79bf6EB2c4f870365E785982E1f101E93b906,
            0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65,
            0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc,
            0x976EA74026E726554dB657fA54763abd0C3a0aa9,
            0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,
            0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f,
            0xa0Ee7A142d267C1f36714E4a8F75612F20a79720,
            0xBcd4042DE499D14e55001CcbB24a551F3b954096,
            0x71bE63f3384f5fb98995898A86B02Fb2426c5788,
            0xFABB0ac9d68B0B445fB7357272Ff202C5651694a,
            0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec,
            0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097,
            0xcd3B766CCDd6AE721141F452C550Ca635964ce71,
            0x2546BcD3c84621e976D8185a91A922aE77ECEc30,
            0xbDA5747bFD65F08deb54cb465eB87D40e51B197E,
            0xdD2FD4581271e230360230F9337D5c0430Bf44C0,
            0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
        ];

        for(uint i=0; i<addresses.length; i++){
            user[student[i]].ad = addresses[i]; 
        }

        votingActive = true;
    }

    modifier onlyOwnerOrTeacher(){
        require(msg.sender == owner || msg.sender == teacher, "Usuario nao autorizado!");
        _;
    }

    modifier onlyAuthorized(){
        require(msg.sender != address(0), "Acesso negado: Usuario nao autorizado!");
        _;
    }

    modifier voting(){
        require(true == votingActive, "Votacao nao iniciada!");
        _;
    }

    event TokenGenerated(string codinome, address codinomeAddress,uint256 amont);

    function issueToken(string memory codinome,  uint256 amount) public onlyOwnerOrTeacher() {
        require(user[codinome].ad != address(0), "Usuario nao encontrado!");
        _mint(user[codinome].ad, amount);
        emit TokenGenerated(codinome, user[codinome].ad ,amount);
    }

    event RegisteredVote(string codinome, uint256 amount);

    function vote(string memory codinome, uint256 amount) public voting() onlyAuthorized() {
        string memory name;
        require(msg.sender != user[codinome].ad, "Nao pode votar em si mesmo!");
        require(amount <= 2*(10**18), "Limite maximo de saTurings atingido!");
        require(user[codinome].ad != address(0), "Usuario nao encontrado!");

        for(uint i=0; i<student.length; i++){
            if(user[student[i]].ad == msg.sender){
                name = student[i];
            }
        }
        require(user[name].voted[codinome] == address(0),"Voce ja votou nesse usuario");

        user[name].voted[codinome] = user[codinome].ad;
        _mint(user[codinome].ad, amount);
        
        _mint(msg.sender, 2*(10**10));

        emit RegisteredVote(codinome, amount);

    }

    function votingOn() public onlyOwnerOrTeacher() {
        votingActive = true;
    }

    function votingOff()  public onlyOwnerOrTeacher() {
        votingActive = false;
    }
}
