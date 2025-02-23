#include<bits/stdc++.h>
using namespace std;
const int N = 10000000;
int es[N + 10];
int prime[N  + 10];
int k = 0;
void Prime(){
    for (int i = 2;i <= N;i ++){
        if (es[i] == 0){
            k ++;
            prime[k] = i;
        }
       
        for (int j = 1;j <= k and i * prime[j] <= N;j ++){
            es[i * prime[j]] = 1;
            if (i % prime[j] == 0)break;
        }
    }
    
}
int main(){
    Prime();
    for (int i = 1;i <= k;i ++)cout << prime[i] << ' ';
    return 0;
}
