//
// smpl_GPIO_Interrupt
//
// GPA15 to input interrupt
// GPD15 to input interrupt

#include <stdio.h>
#include "Driver\DrvUART.h"
#include "Driver\DrvGPIO.h"
#include "Driver\DrvSYS.h"
#include "NUC1xx.h"

void uart_sendStr(uint8_t *str);

void GPIOAB_INT_CallBack(uint32_t GPA_IntStatus, uint32_t GPB_IntStatus)
{
	if ((GPA_IntStatus>>12) & 0x01){
		uart_sendStr("O!\n");
	}
	if ((GPA_IntStatus>>13) & 0x01){
		uart_sendStr("C!\n");
	}
}

void GPIOCDE_INT_CallBack(uint32_t GPC_IntStatus, uint32_t GPD_IntStatus, uint32_t GPE_IntStatus)
{  
	if ((GPC_IntStatus>>1) & 0x01){
		uart_sendStr("D!\n");
	}
	if ((GPC_IntStatus>>2) & 0x01){
		uart_sendStr("R!\n");
	}
	if ((GPC_IntStatus>>3) & 0x01){
		uart_sendStr("L!\n");
	}
	if ((GPD_IntStatus>>7) & 0x01){
		uart_sendStr("U!\n");
	}
}

void initLed(void){
	DrvGPIO_Open(E_GPA, 15, E_IO_OUTPUT); // GPC12 pin set to output mode
	DrvGPIO_ClrBit(E_GPA, 15);            // Goutput Hi to turn off LED
	DrvGPIO_Open(E_GPA, 14, E_IO_OUTPUT); // GPC12 pin set to output mode
	DrvGPIO_ClrBit(E_GPA, 14);            // Goutput Hi to turn off LED
}

void interruptConfig(){
	DrvGPIO_Open(E_GPA,12,E_IO_INPUT);
	DrvGPIO_Open(E_GPA,13,E_IO_INPUT);
  DrvGPIO_EnableInt(E_GPA, 12, E_IO_RISING, E_MODE_EDGE);		//BTN OK
  DrvGPIO_EnableInt(E_GPA, 13, E_IO_RISING, E_MODE_EDGE);		//BTN CANCLE
	DrvGPIO_EnableInt(E_GPC, 1, E_IO_RISING, E_MODE_EDGE);		//BTN DOWN
  DrvGPIO_EnableInt(E_GPC, 2, E_IO_RISING, E_MODE_EDGE);		//BTN RIGHT
	DrvGPIO_EnableInt(E_GPC, 3, E_IO_RISING, E_MODE_EDGE);		//BTN LEFT
  DrvGPIO_EnableInt(E_GPD, 7, E_IO_RISING, E_MODE_EDGE);		//BTN UP
  DrvGPIO_SetDebounceTime(5, 1);
	DrvGPIO_EnableDebounce(E_GPA, 12);
	DrvGPIO_EnableDebounce(E_GPA, 13);
	DrvGPIO_EnableDebounce(E_GPC, 1);
	DrvGPIO_EnableDebounce(E_GPC, 2);
	DrvGPIO_EnableDebounce(E_GPC, 3);
	DrvGPIO_EnableDebounce(E_GPD, 7);
  DrvGPIO_SetIntCallback(GPIOAB_INT_CallBack, GPIOCDE_INT_CallBack);
}

void uart_sendStr(uint8_t *str)
{
	while(*str)
	{
			DrvUART_Write(UART_PORT0,str,1);
			DrvSYS_Delay(10000);
			str++;
	}
}

void uartConfig(){
	STR_UART_T myuart;

	DrvGPIO_InitFunction(E_FUNC_UART0);   

	/* UART Setting */
	myuart.u32BaudRate         = 115200;
	myuart.u8cDataBits         = DRVUART_DATABITS_8;
	myuart.u8cStopBits         = DRVUART_STOPBITS_1;
	myuart.u8cParity         = DRVUART_PARITY_NONE;
	myuart.u8cRxTriggerLevel= DRVUART_FIFO_1BYTES;

	/* Set UART Configuration */
	if(DrvUART_Open(UART_PORT0,&myuart) != E_SUCCESS) 
			DrvGPIO_SetBit(E_GPC,14);
}

int main()
{
	initLed();
	interruptConfig();
	uartConfig();
	while(1)    
	{
//			uart_sendStr("OK");
	}
}
