#include<bits/stdc++.h>
using namespace std;
int s[10000]={1,1};
int n;
int main(){
    cin >> n;
    for (int i = 2;i <= n / i ;i ++){
        if (!s[i])
        for (int j = 2;i * j <= n;j ++)s[i * j] = 1;
    }
    for (int i = 1;i < n;i ++){
        if (s[i] == 0)cout << i << ' ';
    }
    return 0;
}
